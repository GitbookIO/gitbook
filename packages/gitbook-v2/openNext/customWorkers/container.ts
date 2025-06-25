import { Container } from '@cloudflare/containers';
import type { DurableObjectNamespace } from '@cloudflare/workers-types';

interface Env {
    STAGE: string;
}

export class OpenNextContainer extends Container<Env> {
    defaultPort = 3000;
    sleepAfter = '10s';
    startManually = true;
}

export default {
    async fetch(
        request: Request,
        env: { ON_CONTAINER: DurableObjectNamespace<OpenNextContainer> }
    ) {
        const idOne = env.ON_CONTAINER.idFromName('foo');
        const containerInstance = env.ON_CONTAINER.get(idOne);

        await containerInstance.start({
            envVars: {
                HOST: request.headers.get('x-host') || 'localhost:8771',
            },
        });

        // @ts-ignore
        return containerInstance.fetch(request);
    },
};
