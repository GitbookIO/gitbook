globalThis.openNextDebug = false;globalThis.openNextVersion = "3.6.5";

// ../../node_modules/@opennextjs/cloudflare/dist/api/durable-objects/sharded-tag-cache.js
import { DurableObject } from "cloudflare:workers";
var DOShardedTagCache = class extends DurableObject {
  sql;
  constructor(state, env) {
    super(state, env);
    this.sql = state.storage.sql;
    state.blockConcurrencyWhile(async () => {
      this.sql.exec(`CREATE TABLE IF NOT EXISTS revalidations (tag TEXT PRIMARY KEY, revalidatedAt INTEGER)`);
    });
  }
  async getLastRevalidated(tags) {
    try {
      const result = this.sql.exec(`SELECT MAX(revalidatedAt) AS time FROM revalidations WHERE tag IN (${tags.map(() => "?").join(", ")})`, ...tags).toArray();
      if (result.length === 0)
        return 0;
      return result[0]?.time;
    } catch (e) {
      console.error(e);
      return 0;
    }
  }
  async hasBeenRevalidated(tags, lastModified) {
    return this.sql.exec(`SELECT 1 FROM revalidations WHERE tag IN (${tags.map(() => "?").join(", ")}) AND revalidatedAt > ? LIMIT 1`, ...tags, lastModified ?? Date.now()).toArray().length > 0;
  }
  async writeTags(tags, lastModified) {
    tags.forEach((tag) => {
      this.sql.exec(`INSERT OR REPLACE INTO revalidations (tag, revalidatedAt) VALUES (?, ?)`, tag, lastModified);
    });
  }
};
export {
  DOShardedTagCache
};
