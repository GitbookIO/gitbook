import { WorkerEntrypoint } from 'cloudflare:workers';

export * from './CacheObject';
export * from './CacheObjectStub';

export class Worker extends WorkerEntrypoint {};
