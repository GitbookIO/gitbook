import { Container, type OutboundHandler, getRandom } from '@cloudflare/containers';
import { WorkerEntrypoint } from 'cloudflare:workers';

import { CACHE_HOST } from '../container/protocol';
import { type ContainerOutboundEnv, handleCacheOutbound } from './containerOutbound';

// Required by @cloudflare/containers: the outbound interception proxy is looked up on ctx.exports.
export { ContainerProxy } from '@cloudflare/containers';

type ContainerWorkerEnv = ContainerOutboundEnv & {
    NEXT_SERVER_CONTAINER: DurableObjectNamespace<NextServerContainer>;
    CONTAINER_INSTANCES?: string;
};

const DEFAULT_INSTANCES = 3;

function getStringVars(env: unknown): Record<string, string> {
    return Object.fromEntries(
        Object.entries(env as Record<string, unknown>).filter(
            (entry): entry is [string, string] => typeof entry[1] === 'string'
        )
    );
}

export class NextServerContainer extends Container {
    defaultPort = 3000;
    sleepAfter = '10m';
    // Host + path: the @opennextjs/aws `node` wrapper answers this without waking Next.
    pingEndpoint = 'container/__health';
    // The container is a separate process, so worker `vars` do not reach it on their own. Forward
    // them so the app reads the same `process.env` the workerd tier does (GITBOOK_URL, STAGE, ...).
    envVars = getStringVars(this.env);
}

// `Container.outboundByHost` is a static setter that registers the handlers; declaring it as a
// static field on the subclass would shadow it with a plain property and the proxy would never
// find the handler — it would fall through to real internet access instead.
// `Cloudflare.Env` is generated from the root wrangler config and does not describe this worker's
// bindings, hence the cast.
//
// Only the cache host is intercepted; everything else (the GitBook API, the icons CDN) goes out
// normally. Note that loopback traffic cannot be intercepted at all — it never leaves the
// container's network namespace — so anything the app fetches server-side must be a real host.
NextServerContainer.outboundByHost = {
    [CACHE_HOST]: (request, env) =>
        handleCacheOutbound(request, env as unknown as ContainerOutboundEnv),
} satisfies Record<string, OutboundHandler>;

export default class extends WorkerEntrypoint<ContainerWorkerEnv> {
    async fetch(request: Request): Promise<Response> {
        const instances = Number.parseInt(this.env.CONTAINER_INSTANCES ?? '', 10);
        const container = await getRandom(
            this.env.NEXT_SERVER_CONTAINER,
            Number.isNaN(instances) ? DEFAULT_INSTANCES : instances
        );

        return container.fetch(request);
    }
}
