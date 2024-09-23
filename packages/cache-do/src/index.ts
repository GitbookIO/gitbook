import { WorkerEntrypoint } from 'cloudflare:workers';

export * from './CacheObject';
export * from './CacheObjectStub';

export default class Worker extends WorkerEntrypoint {
    fetch() {
        return new Response('Hello, world!');
    }
}
