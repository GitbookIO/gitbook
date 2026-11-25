import type { TryItExtraParameter } from './request';

export interface TryItOperationSession {
    parameters: Record<string, string>;
    /** Stored by name: the index alone can't tell whether it still points at the same type. */
    mediaType: string | null;
    bodyText: string;
    bodyFields: Record<string, string>;
    extraParameters: TryItExtraParameter[];
}

/** Values shared by every operation of one API, like a token entered once. */
export interface TryItApiSession {
    /** Only values the reader typed, so fresh prefill still applies to the rest. */
    auth: Record<string, string>;
    serverURL: string | null;
    serverVariables: Record<string, Record<string, string>>;
}

/**
 * What the reader typed, kept for the page's lifetime so reopening Try it doesn't start over.
 * Scoped per API (its server origins) so a token typed for one API is never sent to another
 * that happens to reuse a scheme name. Memory only: credentials must never reach web storage.
 */
let apis = new Map<string, TryItApiSession>();
let operations = new Map<string, TryItOperationSession>();

/** Identify the API an operation belongs to by the origins of its servers. */
export function getTryItApiScope(servers: { url?: string }[]): string {
    const origins = new Set(
        servers.map((server) => {
            const url = server.url ?? '';
            const match = /^(?:https?:\/\/)?([^/]+)/i.exec(url);
            return (match?.[1] ?? url).toLowerCase();
        })
    );
    return Array.from(origins).sort().join(' ');
}

export function getTryItApiSession(scope: string): TryItApiSession {
    let api = apis.get(scope);
    if (!api) {
        api = { auth: {}, serverURL: null, serverVariables: {} };
        apis.set(scope, api);
    }
    return api;
}

export function getTryItOperationSession(
    scope: string,
    operation: { method: string; path: string }
) {
    return operations.get(operationKey(scope, operation));
}

export function saveTryItOperationSession(
    scope: string,
    operation: { method: string; path: string },
    value: TryItOperationSession
) {
    operations.set(operationKey(scope, operation), value);
}

function operationKey(scope: string, operation: { method: string; path: string }) {
    return `${scope}\n${operation.method.toUpperCase()} ${operation.path}`;
}

/** For tests. */
export function resetTryItSession() {
    apis = new Map();
    operations = new Map();
}
