import { createStreamableValue } from 'ai/rsc';
import type { StreamableValue } from 'ai/rsc';
import { type GitBookBaseContext, fetchSiteContextByURLLookup, getBaseContext } from './context';
import { getEmbeddableLinker } from './embeddable-linker';
import { createMidStreamErrorHandler } from './graceful-stream';
import {
    getSiteURLDataFromMiddleware,
    getSiteURLFromMiddleware,
    getURLModeFromMiddleware,
} from './middleware';

/**
 * Get the base context for a server action.
 * This function should only be called in a server action.
 */
export async function getServerActionBaseContext(options?: { isEmbeddable?: boolean }) {
    const siteURL = await getSiteURLFromMiddleware();
    const siteURLData = await getSiteURLDataFromMiddleware();
    const urlMode = await getURLModeFromMiddleware();

    const context = getBaseContext({
        siteURL,
        siteURLData,
        urlMode,
    });

    if (options?.isEmbeddable) {
        return {
            ...context,
            linker: getEmbeddableLinker(context.linker),
        };
    }

    return context;
}

/**
 * Fetch the context for a site in a server action.
 * The server action is always dynamic and the request is passed through the middleware.
 */
export async function fetchServerActionSiteContext(baseContext: GitBookBaseContext) {
    const siteURLData = await getSiteURLDataFromMiddleware();
    return fetchSiteContextByURLLookup(baseContext, siteURLData);
}

/**
 * Run a server action that streams values to the client using `createStreamableValue`.
 *
 * When an error occurs after the stream has started delivering content, it is
 * converted into a final value via `onError` and the stream closes cleanly —
 * preserving partial content on the client.
 *
 * When an error occurs before any value has been pushed, it is propagated
 * normally so the client receives a full error state.
 */
export function runStreamableServerAction<T>({
    onError,
    run,
}: {
    onError: (error: unknown, lastValue: T | undefined) => T | undefined;
    run: (push: (value: T) => void) => Promise<void>;
}): { stream: StreamableValue<T> } {
    const responseStream = createStreamableValue<T>();
    const errorHandler = createMidStreamErrorHandler<T>(onError);

    run((value) => {
        errorHandler.track(value);
        responseStream.update(value);
    })
        .then(() => {
            responseStream.done();
        })
        .catch((error) => {
            errorHandler.handleError(error, {
                update: (value) => responseStream.update(value),
                done: () => responseStream.done(),
                fail: (err) => responseStream.error(err),
            });
        });

    return { stream: responseStream.value };
}
