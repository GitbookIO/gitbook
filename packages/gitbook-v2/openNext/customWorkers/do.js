// This worker only purposes it to host the different DO that we will need in the other workers.
import { DurableObject } from 'cloudflare:workers';

export class R2WriteBuffer extends DurableObject {
    writePromise;

    async write(cacheKey, value) {
        // We are already writing to this key
        if (this.writePromise) {
            return;
        }

        this.writePromise = this.env.NEXT_INC_CACHE_R2_BUCKET.put(cacheKey, value);
        this.ctx.waitUntil(
            this.writePromise.finally(() => {
                this.writePromise = undefined;
            })
        );
    }
}

// TODO: replace once i figured out why `revalidateTag` is not working in preview
export class DOShardedTagCache extends DurableObject {
    sql;

    constructor(state, env) {
        super(state, env);
        this.sql = state.storage.sql;
        state.blockConcurrencyWhile(async () => {
            this.sql.exec(
                'CREATE TABLE IF NOT EXISTS revalidations (tag TEXT PRIMARY KEY, revalidatedAt INTEGER)'
            );
        });
    }

    async getLastRevalidated(tags) {
        try {
            const result = this.sql
                .exec(
                    `SELECT MAX(revalidatedAt) AS time FROM revalidations WHERE tag IN (${tags.map(() => '?').join(', ')})`,
                    ...tags
                )
                .toArray();
            console.log('getLastRevalidated', tags, result);
            if (result.length === 0) return 0;
            // We only care about the most recent revalidation
            return result[0]?.time ?? 0;
        } catch (e) {
            console.error(e);
            // By default we don't want to crash here, so we return 0
            return 0;
        }
    }

    async hasBeenRevalidated(tags, lastModified) {
        const result = this.sql
            .exec(
                `SELECT 1 FROM revalidations WHERE tag IN (${tags.map(() => '?').join(', ')}) AND revalidatedAt > ? LIMIT 1`,
                ...tags,
                lastModified ?? Date.now()
            )
            .toArray();

        console.log('hasBeenRevalidated', tags, lastModified, result);
        return result.length > 0;
    }

    async writeTags(tags, lastModified) {
        console.log('writeTags', tags, lastModified);
        tags.forEach((tag) => {
            this.sql.exec(
                'INSERT OR REPLACE INTO revalidations (tag, revalidatedAt) VALUES (?, ?)',
                tag,
                lastModified
            );
        });
    }
}

export { DOQueueHandler } from '../../.open-next/.build/durable-objects/queue.js';

export default {
    async fetch() {
        // This worker does not handle any requests, it only provides Durable Objects
        return new Response('This worker is not meant to handle requests directly', {
            status: 400,
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    },
};
