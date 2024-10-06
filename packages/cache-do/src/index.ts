import { WorkerEntrypoint } from 'cloudflare:workers';

export * from './CacheObject';

export default class Worker extends WorkerEntrypoint {
    fetch() {
        return new Response('Hello, world!');
    }
}
