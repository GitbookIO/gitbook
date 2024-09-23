import { encode, decode } from '@msgpack/msgpack';
import { DurableObject } from 'cloudflare:workers';

export interface CacheObjectDescriptor {
    get: <Value = unknown>(key: string) => Promise<Value | undefined>;
    set: <Value = unknown>(key: string, value: Value, expiresAt: number) => Promise<void>;
}

interface CacheObjectProp<Value = unknown> {
    value: Value;
    expiresAt: number;
}

export class CacheObject extends DurableObject {
    public open(): CacheObjectDescriptor {
        return {
            get: async <Value = unknown>(key: string) => {
                return this.get<Value>(key);
            },
            set: async <Value = unknown>(key: string, value: Value, expiresAt: number) => {
                await this.set(key, value, expiresAt);
            },
        };
    }

    /**
     * Get the value of a property from the cache object.
     */
    public async get<Value = unknown>(key: string) {
        const entries = await this.ctx.storage.list<Uint8Array>({
            prefix: getStoragePropKey(key),
        });
        if (!entries.size) {
            return;
        }

        const entry = decodeChunks<CacheObjectProp<Value>>(entries);
        if (!entry || entry.expiresAt < Date.now()) {
            return;
        }

        return entry.value;
    }

    /**
     * Set a value in the cache object.
     */
    public async set<Value = unknown>(key: string, value: Value, expiresAt: number) {
        const prop: CacheObjectProp<Value> = {
            value,
            expiresAt,
        };

        await this.ctx.storage.transaction(async (tx) => {
            await tx.put(getGCClockKey(key, expiresAt), key);

            const entries = encodeChunks(key, prop);
            await tx.put(entries);

            const currentAlarm = await tx.getAlarm();
            if (!currentAlarm) {
                // Set an alarm to garbage collect all entries that have expired in 12h.
                await tx.setAlarm(Date.now() + 12 * 60 * 60 * 1000);
            }
        });
    }

    /**
     * Purge all keys in the cache object.
     */
    public async purge() {
        await this.ctx.storage.deleteAll();
    }

    /**
     * Alarm to garbage collect all entries that have expired.
     */
    async alarm() {
        const entries = await this.ctx.storage.list<string>({
            prefix: 'exp.',
        });
        const toDelete: string[] = [];

        for (const [key, targetKey] of entries) {
            const timestamp = parseInt(key.split('.')[1]);
            if (timestamp < Date.now()) {
                toDelete.push(key);
                toDelete.push(targetKey);
            }
        }

        // Delete the keys by batch of 128.
        for (let i = 0; i < toDelete.length; i += 128) {
            await this.ctx.storage.delete(toDelete.slice(i, i + 128));
        }

        // If there are still keys to delete, set an alarm to continue the deletion in 12h.
        if (toDelete.length) {
            await this.ctx.storage.setAlarm(Date.now() + 12 * 60 * 60 * 1000);
        }
    }
}

function getStoragePropKey(key: string): string {
    return `prop.${key}.`;
}

function getStoragePropChunkKey(key: string, index: number): string {
    return `${getStoragePropKey(key)}${index}`;
}

function getGCClockRootKey(timestamp: number): string {
    return `exp.${timestamp}.`;
}

function getGCClockKey(key: string, expiresAt: number): string {
    return `${getGCClockRootKey(expiresAt)}${key}`;
}

function encodeChunks<T>(key: string, value: T): Record<string, Uint8Array> {
    const buf = encode(value);
    const entries: Record<string, Uint8Array> = {};
    const chunks = chunkUint8Array(buf, 128 * 1024);

    for (let index = 0; index < chunks.length; index++) {
        entries[getStoragePropChunkKey(key, index)] = chunks[index];
    }

    return entries;
}

function decodeChunks<T>(entries: Map<string, Uint8Array>): T | undefined {
    const chunks = Array.from(entries.entries())
        .map(([key, value]) => {
            const index = parseInt(key.split('.').pop()!);
            return [index, value] as const;
        })
        .sort(([a], [b]) => a - b)
        .map(([, value]) => value);

    if (chunks.length === 0) {
        return;
    }

    const buf = mergeUint8Array(chunks);
    return decode(buf) as T;
}

function chunkUint8Array(input: Uint8Array, chunkSize: number): Uint8Array[] {
    const chunks: Uint8Array[] = [];
    for (let i = 0; i < input.length; i += chunkSize) {
        chunks.push(input.slice(i, i + chunkSize));
    }
    return chunks;
}

function mergeUint8Array(chunks: Uint8Array[]): Uint8Array {
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }
    return result;
}
