import { encode, decode } from '@msgpack/msgpack';
import { DurableObject } from 'cloudflare:workers';
import { LRUMap } from 'lru_map';

export interface CacheObjectDescriptor {
    get: <Value = unknown>(key: string) => Promise<Value | undefined>;
    set: <Value = unknown>(key: string, value: Value, expiresAt: number) => Promise<void>;
}

/**
 * Value stored in a cuncked binary msgpack format.
 * Stored under the key `prop.${key}.${index}`. 
 */
interface CacheObjectProp<Value = unknown> {
    value: Value;
    expiresAt: number;
}

/**
 * Expiration clock stored under the key `exp.${expiresAt}.${key}`.
 */
interface CacheObjectExp {
    /** Key of the property */
    k: string;
    /** Number of chunks */
    c: number;
}

/**
 * Durable Object class being deployed as a distributed cache.
 */
export class CacheObject extends DurableObject {
    private lru = new LRUMap<string, { match: CacheObjectProp | undefined }>(500);

    /**
     * Open a descriptor to access the cache object.
     * The goal is to minimize the amount of RPC sessions between the client and the cache object.
     * One session is opened per request on the client side and used to perform multiple operations.
     */
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
     * Get the value of a property.
     */
    public async get<Value = unknown>(key: string) {
        return timeFn(`get: ${key}`, async () => {
            // Try the memory state first.
            const memoryEntry = this.lru.get(key);
            if (memoryEntry) {
                console.log(`get: (memory, ${!!memoryEntry.match}) ${key}`);
                if (!memoryEntry.match) {
                    return;
                }

                if (memoryEntry.match.expiresAt > Date.now()) {
                    return memoryEntry.match.value as Value;
                }
            }

            return await this.getFromStorage<Value>(key);
        });
    }

    /**
     * Get the value of a property from the DO storage.
     */
    public async getFromStorage<Value = unknown>(key: string) {
        const entries = await this.ctx.storage.list<Uint8Array>({
            prefix: getStoragePropKey(key),
            noCache: true,
        });
        if (entries.size) {
            const entry = decodeChunks<CacheObjectProp<Value>>(entries);
            if (entry && entry.expiresAt > Date.now()) {
                // Found
                this.lru.set(key, { match: entry });
                return entry.value;
            }
        }

        // Not found
        this.lru.set(key, { match: undefined });
    }

    /**
     * Set a value in the cache object.
     */
    public async set<Value = unknown>(key: string, value: Value, expiresAt: number) {
        return timeFn(`set: ${key}`, async () => {
            const prop: CacheObjectProp<Value> = {
                value,
                expiresAt,
            };

            this.lru.set(key, { match: prop });
            await this.ctx.storage.transaction(async (tx) => {
                const entries = encodeChunks(key, prop);

                const clockValue: CacheObjectExp = {
                    k: key,
                    c: Object.keys(entries).length,
                };

                await tx.put(getGCClockKey(key, expiresAt), clockValue);
                await tx.put(entries);

                const currentAlarm = await tx.getAlarm();
                if (!currentAlarm) {
                    // Set an alarm to garbage collect all entries that have expired in 12h.
                    await tx.setAlarm(Date.now() + 12 * 60 * 60 * 1000);
                }
            });
        });
    }

    /**
     * Purge all keys in the cache object.
     */
    public async purge() {
        let result = new Set<string>();

        try {
            // List all the keys in the cache object.
            const entries = await this.ctx.storage.list<CacheObjectExp>({
                prefix: 'exp.',
                noCache: true,
            });
            console.log(`purge: ${entries.size} entries`);
            entries.forEach((exp) => {
                result.add(exp.k);
            });
        } catch (error) {
            // If an error occurs, reset the cache object.
            // This is a safety mechanism to prevent the cache object from being stuck in a bad state.
            console.error('Error during purge, reset the cache object', error);
        }

        await this.reset();

        console.log(`purge returns`, Array.from(result));
        return Array.from(result);
    }

    /**
     * Alarm to garbage collect all entries that have expired.
     */
    async alarm() {
        try {
            const entries = await this.ctx.storage.list<CacheObjectExp>({
                prefix: 'exp.',
                noCache: true,
            });
            const toDeleteSet = new Set<string>();

            for (const [key, exp] of entries) {
                const timestamp = parseInt(key.split('.')[1]);
                if (timestamp < Date.now()) {
                    toDeleteSet.add(key);
                    for (let i = 0; i < exp.c; i++) {
                        toDeleteSet.add(getStoragePropChunkKey(exp.k, i));
                    }
                }
            }

            // Delete the keys by batch of 128.
            const toDelete = Array.from(toDeleteSet);
            for (let i = 0; i < toDelete.length; i += 128) {
                await this.ctx.storage.delete(toDelete.slice(i, i + 128));
            }

            // If there are still keys to delete, set an alarm to continue the deletion in 12h.
            if (toDelete.length) {
                await this.ctx.storage.setAlarm(Date.now() + 12 * 60 * 60 * 1000);
            }
        } catch (error) {
            // If an error occurs, reset the cache object.
            // This is a safety mechanism to prevent the cache object from being stuck in a bad state.
            console.error('Error during alarm, reset the cache object', error);
            await this.reset();
        }
    }

    /**
     * Reset the cache object.
     */
    async reset() {
        console.log('reset: clear all entries');
        this.lru.clear();
        await this.ctx.storage.deleteAll();
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

async function timeFn<T>(message: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
        return await fn();
    } finally {
        console.log(`${message} (${performance.now() - start}ms)`);
    }
}
