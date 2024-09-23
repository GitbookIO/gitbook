import { DurableObject } from "cloudflare:workers";

export interface CacheObjectDescriptor<Value = unknown> {
    get: (key: string) => Promise<Value | undefined>;
    set: (key: string, value: Value) => Promise<void>;
}

export class CacheObject extends DurableObject {
    public open<Value = unknown>(): CacheObjectDescriptor<Value> {
        return {
            get: async (key: string) => {
                const value = await this.ctx.storage.get<Value>(key);
                return value;
            },
            set: async (key: string, value: Value) => {
                await this.ctx.storage.put(key, value);
            }
        };
    }

    public async purge() {
        // Delete all keys
        await this.ctx.storage.deleteAll();
    }

}
