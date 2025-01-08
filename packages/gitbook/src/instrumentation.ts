import * as Sentry from '@sentry/nextjs';

export async function register() {
    await import('../sentry.edge.config');
}

export const onRequestError = captureRequestError;

// The code below is taken from @sentry/nextjs package

type ErrorContext = {
    routerKind: string; // 'Pages Router' | 'App Router'
    routePath: string;
    routeType: string; // 'render' | 'route' | 'middleware'
};

type RequestInfo = {
    path: string;
    method: string;
    headers: Record<string, string | string[] | undefined>;
};

function headersToDict(
    reqHeaders: Record<string, string | string[] | undefined>,
): Record<string, string> {
    const headers: Record<string, string> = Object.create(null);

    try {
        Object.entries(reqHeaders).forEach(([key, value]) => {
            if (typeof value === 'string') {
                headers[key] = value;
            }
        });
    } catch (e) {}

    return headers;
}

/**
 * Reports errors passed to the the Next.js `onRequestError` instrumentation hook.
 */
function captureRequestError(
    error: unknown,
    request: RequestInfo,
    errorContext: ErrorContext,
): void {
    Sentry.withScope((scope) => {
        scope.setSDKProcessingMetadata({
            normalizedRequest: {
                headers: headersToDict(request.headers),
                method: request.method,
            },
        });

        scope.setContext('nextjs', {
            request_path: request.path,
            router_kind: errorContext.routerKind,
            router_path: errorContext.routePath,
            route_type: errorContext.routeType,
        });

        scope.setTransactionName(errorContext.routePath);

        Sentry.captureException(error, {
            mechanism: {
                handled: false,
            },
        });
    });
}
