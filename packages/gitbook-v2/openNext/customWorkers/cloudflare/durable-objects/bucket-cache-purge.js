globalThis.openNextDebug = false;globalThis.openNextVersion = "3.6.5";

// ../../node_modules/@opennextjs/cloudflare/dist/api/durable-objects/bucket-cache-purge.js
import { DurableObject } from "cloudflare:workers";

// ../../node_modules/@opennextjs/cloudflare/dist/api/cloudflare-context.js
var cloudflareContextSymbol = Symbol.for("__cloudflare-context__");

// ../../node_modules/@opennextjs/cloudflare/dist/api/overrides/internal.js
var debugCache = (name, ...args) => {
  if (process.env.NEXT_PRIVATE_DEBUG_CACHE) {
    console.log(`[${name}] `, ...args);
  }
};
async function internalPurgeCacheByTags(env, tags) {
  if (!env.CACHE_PURGE_ZONE_ID && !env.CACHE_PURGE_API_TOKEN) {
    debugCache("purgeCacheByTags", "No cache zone ID or API token provided. Skipping cache purge.");
    return "missing-credentials";
  }
  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CACHE_PURGE_ZONE_ID}/purge_cache`, {
      headers: {
        Authorization: `Bearer ${env.CACHE_PURGE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({
        tags
      })
    });
    if (response.status === 429) {
      debugCache("purgeCacheByTags", "Rate limit exceeded. Skipping cache purge.");
      return "rate-limit-exceeded";
    }
    const bodyResponse = await response.json();
    if (!bodyResponse.success) {
      debugCache("purgeCacheByTags", "Cache purge failed. Errors:", bodyResponse.errors.map((error) => `${error.code}: ${error.message}`));
      return "purge-failed";
    }
    debugCache("purgeCacheByTags", "Cache purged successfully for tags:", tags);
    return "purge-success";
  } catch (error) {
    console.error("Error purging cache by tags:", error);
    return "purge-failed";
  }
}

// ../../node_modules/@opennextjs/cloudflare/dist/api/durable-objects/bucket-cache-purge.js
var DEFAULT_BUFFER_TIME_IN_SECONDS = 5;
var MAX_NUMBER_OF_TAGS_PER_PURGE = 100;
var BucketCachePurge = class extends DurableObject {
  bufferTimeInSeconds;
  constructor(state, env) {
    super(state, env);
    this.bufferTimeInSeconds = env.NEXT_CACHE_DO_PURGE_BUFFER_TIME_IN_SECONDS ? parseInt(env.NEXT_CACHE_DO_PURGE_BUFFER_TIME_IN_SECONDS) : DEFAULT_BUFFER_TIME_IN_SECONDS;
    state.blockConcurrencyWhile(async () => {
      state.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS cache_purge (
        tag TEXT NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS tag_index ON cache_purge (tag);
      `);
    });
  }
  async purgeCacheByTags(tags) {
    for (const tag of tags) {
      this.ctx.storage.sql.exec(`
        INSERT OR REPLACE INTO cache_purge (tag)
        VALUES (?)`, [tag]);
    }
    const nextAlarm = await this.ctx.storage.getAlarm();
    if (!nextAlarm) {
      this.ctx.storage.setAlarm(Date.now() + this.bufferTimeInSeconds * 1e3);
    }
  }
  async alarm() {
    let tags = this.ctx.storage.sql.exec(`
      SELECT * FROM cache_purge LIMIT ${MAX_NUMBER_OF_TAGS_PER_PURGE}
    `).toArray();
    do {
      if (tags.length === 0) {
        return;
      }
      const result = await internalPurgeCacheByTags(this.env, tags.map((row) => row.tag));
      if (result === "rate-limit-exceeded") {
        throw new Error("Rate limit exceeded");
      }
      this.ctx.storage.sql.exec(`
        DELETE FROM cache_purge
        WHERE tag IN (${tags.map(() => "?").join(",")})
      `, tags.map((row) => row.tag));
      if (tags.length < MAX_NUMBER_OF_TAGS_PER_PURGE) {
        tags = [];
      } else {
        tags = this.ctx.storage.sql.exec(`
          SELECT * FROM cache_purge LIMIT ${MAX_NUMBER_OF_TAGS_PER_PURGE}
        `).toArray();
      }
    } while (tags.length >= 0);
  }
};
export {
  BucketCachePurge
};
