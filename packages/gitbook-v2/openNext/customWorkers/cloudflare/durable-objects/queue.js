globalThis.openNextDebug = false;globalThis.openNextVersion = "3.6.5";

// ../../node_modules/@opennextjs/aws/dist/utils/error.js
var IgnorableError = class extends Error {
  __openNextInternal = true;
  canIgnore = true;
  logLevel = 0;
  constructor(message) {
    super(message);
    this.name = "IgnorableError";
  }
};
var RecoverableError = class extends Error {
  __openNextInternal = true;
  canIgnore = true;
  logLevel = 1;
  constructor(message) {
    super(message);
    this.name = "RecoverableError";
  }
};
var FatalError = class extends Error {
  __openNextInternal = true;
  canIgnore = false;
  logLevel = 2;
  constructor(message) {
    super(message);
    this.name = "FatalError";
  }
};
function isOpenNextError(e) {
  try {
    return "__openNextInternal" in e;
  } catch {
    return false;
  }
}

// ../../node_modules/@opennextjs/aws/dist/adapters/logger.js
function debug(...args) {
  if (globalThis.openNextDebug) {
    console.log(...args);
  }
}
function warn(...args) {
  console.warn(...args);
}
var DOWNPLAYED_ERROR_LOGS = [
  {
    clientName: "S3Client",
    commandName: "GetObjectCommand",
    errorName: "NoSuchKey"
  }
];
var isDownplayedErrorLog = (errorLog) => DOWNPLAYED_ERROR_LOGS.some((downplayedInput) => downplayedInput.clientName === errorLog?.clientName && downplayedInput.commandName === errorLog?.commandName && (downplayedInput.errorName === errorLog?.error?.name || downplayedInput.errorName === errorLog?.error?.Code));
function error(...args) {
  if (args.some((arg) => isDownplayedErrorLog(arg))) {
    return debug(...args);
  }
  if (args.some((arg) => isOpenNextError(arg))) {
    const error2 = args.find((arg) => isOpenNextError(arg));
    if (error2.logLevel < getOpenNextErrorLogLevel()) {
      return;
    }
    if (error2.logLevel === 0) {
      return console.log(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    if (error2.logLevel === 1) {
      return warn(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    return console.error(...args);
  }
  console.error(...args);
}
function getOpenNextErrorLogLevel() {
  const strLevel = process.env.OPEN_NEXT_ERROR_LOG_LEVEL ?? "1";
  switch (strLevel.toLowerCase()) {
    case "debug":
    case "0":
      return 0;
    case "error":
    case "2":
      return 2;
    default:
      return 1;
  }
}

// ../../node_modules/@opennextjs/cloudflare/dist/api/durable-objects/queue.js
import { DurableObject } from "cloudflare:workers";
var DEFAULT_MAX_REVALIDATION = 5;
var DEFAULT_REVALIDATION_TIMEOUT_MS = 1e4;
var DEFAULT_RETRY_INTERVAL_MS = 2e3;
var DEFAULT_MAX_RETRIES = 6;
var DOQueueHandler = class extends DurableObject {
  // Ongoing revalidations are deduped by the deduplication id
  // Since this is running in waitUntil, we expect the durable object state to persist this during the duration of the revalidation
  // TODO: handle incremental cache with only eventual consistency (i.e. KV or R2/D1 with the optional cache layer on top)
  ongoingRevalidations = /* @__PURE__ */ new Map();
  sql;
  routeInFailedState = /* @__PURE__ */ new Map();
  service;
  // Configurable params
  maxRevalidations;
  revalidationTimeout;
  revalidationRetryInterval;
  maxRetries;
  disableSQLite;
  constructor(ctx, env) {
    super(ctx, env);
    this.service = env.WORKER_SELF_REFERENCE;
    if (!this.service)
      throw new IgnorableError("No service binding for cache revalidation worker");
    this.sql = ctx.storage.sql;
    this.maxRevalidations = env.NEXT_CACHE_DO_QUEUE_MAX_REVALIDATION ? parseInt(env.NEXT_CACHE_DO_QUEUE_MAX_REVALIDATION) : DEFAULT_MAX_REVALIDATION;
    this.revalidationTimeout = env.NEXT_CACHE_DO_QUEUE_REVALIDATION_TIMEOUT_MS ? parseInt(env.NEXT_CACHE_DO_QUEUE_REVALIDATION_TIMEOUT_MS) : DEFAULT_REVALIDATION_TIMEOUT_MS;
    this.revalidationRetryInterval = env.NEXT_CACHE_DO_QUEUE_RETRY_INTERVAL_MS ? parseInt(env.NEXT_CACHE_DO_QUEUE_RETRY_INTERVAL_MS) : DEFAULT_RETRY_INTERVAL_MS;
    this.maxRetries = env.NEXT_CACHE_DO_QUEUE_MAX_RETRIES ? parseInt(env.NEXT_CACHE_DO_QUEUE_MAX_RETRIES) : DEFAULT_MAX_RETRIES;
    this.disableSQLite = env.NEXT_CACHE_DO_QUEUE_DISABLE_SQLITE === "true";
    ctx.blockConcurrencyWhile(async () => {
      debug(`Restoring the state of the durable object`);
      await this.initState();
    });
    debug(`Durable object initialized`);
  }
  async revalidate(msg) {
    if (this.ongoingRevalidations.size > 2 * this.maxRevalidations) {
      warn(`Your durable object has 2 times the maximum number of revalidations (${this.maxRevalidations}) in progress. If this happens often, you should consider increasing the NEXT_CACHE_DO_QUEUE_MAX_REVALIDATION or the number of durable objects with the MAX_REVALIDATE_CONCURRENCY env var.`);
    }
    if (this.ongoingRevalidations.has(msg.MessageDeduplicationId))
      return;
    if (this.routeInFailedState.has(msg.MessageDeduplicationId))
      return;
    if (this.checkSyncTable(msg))
      return;
    if (this.ongoingRevalidations.size >= this.maxRevalidations) {
      debug(`The maximum number of revalidations (${this.maxRevalidations}) is reached. Blocking until one of the revalidations finishes.`);
      while (this.ongoingRevalidations.size >= this.maxRevalidations) {
        const ongoingRevalidations = this.ongoingRevalidations.values();
        debug(`Waiting for one of the revalidations to finish`);
        await Promise.race(ongoingRevalidations);
      }
    }
    const revalidationPromise = this.executeRevalidation(msg);
    this.ongoingRevalidations.set(msg.MessageDeduplicationId, revalidationPromise);
    this.ctx.waitUntil(revalidationPromise);
  }
  async executeRevalidation(msg) {
    try {
      debug(`Revalidating ${msg.MessageBody.host}${msg.MessageBody.url}`);
      const { MessageBody: { host, url } } = msg;
      const protocol = host.includes("localhost") ? "http" : "https";
      const response = await this.service.fetch(`${protocol}://${host}${url}`, {
        method: "HEAD",
        headers: {
          // This is defined during build
          "x-prerender-revalidate": "e7d1449a4136a34776a83dfe63a2d4ef",
          "x-isr": "1"
        },
        // This one is kind of problematic, it will always show the wall time of the revalidation to `this.revalidationTimeout`
        signal: AbortSignal.timeout(this.revalidationTimeout)
      });
      if (response.status === 200 && response.headers.get("x-nextjs-cache") !== "REVALIDATED") {
        this.routeInFailedState.delete(msg.MessageDeduplicationId);
        throw new FatalError(`The revalidation for ${host}${url} cannot be done. This error should never happen.`);
      } else if (response.status === 404) {
        this.routeInFailedState.delete(msg.MessageDeduplicationId);
        throw new IgnorableError(`The revalidation for ${host}${url} cannot be done because the page is not found. It's either expected or an error in user code itself`);
      } else if (response.status === 500) {
        await this.addToFailedState(msg);
        throw new IgnorableError(`Something went wrong while revalidating ${host}${url}`);
      } else if (response.status !== 200) {
        await this.addToFailedState(msg);
        throw new RecoverableError(`An unknown error occurred while revalidating ${host}${url}`);
      }
      if (!this.disableSQLite) {
        this.sql.exec(
          "INSERT OR REPLACE INTO sync (id, lastSuccess, buildId) VALUES (?, unixepoch(), ?)",
          // We cannot use the deduplication id because it's not unique per route - every time a route is revalidated, the deduplication id is different.
          `${host}${url}`,
          "FsLrCjhoJaCSdOYr51rb3"
        );
      }
      this.routeInFailedState.delete(msg.MessageDeduplicationId);
    } catch (e) {
      if (!isOpenNextError(e)) {
        await this.addToFailedState(msg);
      }
      error(e);
    } finally {
      this.ongoingRevalidations.delete(msg.MessageDeduplicationId);
    }
  }
  async alarm() {
    const currentDateTime = Date.now();
    const nextEventToRetry = Array.from(this.routeInFailedState.values()).filter(({ nextAlarmMs }) => nextAlarmMs > currentDateTime).sort(({ nextAlarmMs: a }, { nextAlarmMs: b }) => a - b)[0];
    const expiredEvents = Array.from(this.routeInFailedState.values()).filter(({ nextAlarmMs }) => nextAlarmMs <= currentDateTime);
    const allEventsToRetry = nextEventToRetry ? [nextEventToRetry, ...expiredEvents] : expiredEvents;
    for (const event of allEventsToRetry) {
      debug(`Retrying revalidation for ${event.msg.MessageBody.host}${event.msg.MessageBody.url}`);
      await this.executeRevalidation(event.msg);
    }
  }
  async addToFailedState(msg) {
    debug(`Adding ${msg.MessageBody.host}${msg.MessageBody.url} to the failed state`);
    const existingFailedState = this.routeInFailedState.get(msg.MessageDeduplicationId);
    let updatedFailedState;
    if (existingFailedState) {
      if (existingFailedState.retryCount >= this.maxRetries) {
        error(`The revalidation for ${msg.MessageBody.host}${msg.MessageBody.url} has failed after ${this.maxRetries} retries. It will not be tried again, but subsequent ISR requests will retry.`);
        this.routeInFailedState.delete(msg.MessageDeduplicationId);
        return;
      }
      const nextAlarmMs = Date.now() + Math.pow(2, existingFailedState.retryCount + 1) * this.revalidationRetryInterval;
      updatedFailedState = {
        ...existingFailedState,
        retryCount: existingFailedState.retryCount + 1,
        nextAlarmMs
      };
    } else {
      updatedFailedState = {
        msg,
        retryCount: 1,
        nextAlarmMs: Date.now() + 2e3
      };
    }
    this.routeInFailedState.set(msg.MessageDeduplicationId, updatedFailedState);
    if (!this.disableSQLite) {
      this.sql.exec("INSERT OR REPLACE INTO failed_state (id, data, buildId) VALUES (?, ?, ?)", msg.MessageDeduplicationId, JSON.stringify(updatedFailedState), "FsLrCjhoJaCSdOYr51rb3");
    }
    await this.addAlarm();
  }
  async addAlarm() {
    const existingAlarm = await this.ctx.storage.getAlarm({ allowConcurrency: false });
    if (existingAlarm)
      return;
    if (this.routeInFailedState.size === 0)
      return;
    let nextAlarmToSetup = Math.min(...Array.from(this.routeInFailedState.values()).map(({ nextAlarmMs }) => nextAlarmMs));
    if (nextAlarmToSetup < Date.now()) {
      nextAlarmToSetup = Date.now() + this.revalidationRetryInterval;
    }
    await this.ctx.storage.setAlarm(nextAlarmToSetup);
  }
  // This function is used to restore the state of the durable object
  // We don't restore the ongoing revalidations because we cannot know in which state they are
  // We only restore the failed state and the alarm
  async initState() {
    if (this.disableSQLite)
      return;
    this.sql.exec("CREATE TABLE IF NOT EXISTS failed_state (id TEXT PRIMARY KEY, data TEXT, buildId TEXT)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS sync (id TEXT PRIMARY KEY, lastSuccess INTEGER, buildId TEXT)");
    this.sql.exec("DELETE FROM failed_state WHERE buildId != ?", "FsLrCjhoJaCSdOYr51rb3");
    this.sql.exec("DELETE FROM sync WHERE buildId != ?", "FsLrCjhoJaCSdOYr51rb3");
    const failedStateCursor = this.sql.exec("SELECT * FROM failed_state");
    for (const row of failedStateCursor) {
      this.routeInFailedState.set(row.id, JSON.parse(row.data));
    }
    await this.addAlarm();
  }
  /**
   *
   * @param msg
   * @returns `true` if the route has been revalidated since the lastModified from the message, `false` otherwise
   */
  checkSyncTable(msg) {
    try {
      if (this.disableSQLite)
        return false;
      return this.sql.exec("SELECT 1 FROM sync WHERE id = ? AND lastSuccess > ? LIMIT 1", `${msg.MessageBody.host}${msg.MessageBody.url}`, Math.round(msg.MessageBody.lastModified / 1e3)).toArray().length > 0;
    } catch {
      return false;
    }
  }
};
export {
  DOQueueHandler
};
