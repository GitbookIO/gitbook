import { AsyncLocalStorage } from "node:async_hooks";
import process from "node:process";
import stream from "node:stream";
import * as nextEnvVars from "./next-env.mjs";
const cloudflareContextALS = new AsyncLocalStorage();
Object.defineProperty(globalThis, Symbol.for("__cloudflare-context__"), {
  get() {
    return cloudflareContextALS.getStore();
  }
});
async function runWithCloudflareRequestContext(request, env, ctx, handler) {
  init(request, env);
  return cloudflareContextALS.run({ env, ctx, cf: request.cf }, handler);
}
let initialized = false;
function init(request, env) {
  if (initialized) {
    return;
  }
  initialized = true;
  const url = new URL(request.url);
  initRuntime();
  populateProcessEnv(url, env);
}
function initRuntime() {
  Object.assign(process, { version: process.version || "v22.14.0" });
  Object.assign(process.versions, { node: "22.14.0", ...process.versions });
  globalThis.__dirname ??= "";
  globalThis.__filename ??= "";
  import.meta.url ??= "file:///worker.js";
  const __original_fetch = globalThis.fetch;
  globalThis.fetch = (input, init2) => {
    if (init2) {
      delete init2.cache;
    }
    return __original_fetch(input, init2);
  };
  const CustomRequest = class extends globalThis.Request {
    constructor(input, init2) {
      if (init2) {
        delete init2.cache;
        Object.defineProperty(init2, "body", {
          // @ts-ignore
          value: init2.body instanceof stream.Readable ? ReadableStream.from(init2.body) : init2.body
        });
      }
      super(input, init2);
    }
  };
  Object.assign(globalThis, {
    Request: CustomRequest,
    __BUILD_TIMESTAMP_MS__: 1750516662934,
    __NEXT_BASE_PATH__: "",
    // The external middleware will use the convertTo function of the `edge` converter
    // by default it will try to fetch the request, but since we are running everything in the same worker
    // we need to use the request as is.
    __dangerous_ON_edge_converter_returns_request: true
  });
}
function populateProcessEnv(url, env) {
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === "string") {
      process.env[key] = value;
    }
  }
  const mode = env.NEXTJS_ENV ?? "production";
  if (nextEnvVars[mode]) {
    for (const key in nextEnvVars[mode]) {
      process.env[key] ??= nextEnvVars[mode][key];
    }
  }
  process.env.OPEN_NEXT_ORIGIN = JSON.stringify({
    default: {
      host: url.hostname,
      protocol: url.protocol.slice(0, -1),
      port: url.port
    }
  });
  process.env.__NEXT_PRIVATE_ORIGIN = url.origin;
}
export {
  runWithCloudflareRequestContext
};
