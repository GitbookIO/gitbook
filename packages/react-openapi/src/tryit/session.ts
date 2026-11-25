import type { OpenAPIV3 } from '@gitbook/openapi-parser';

import { interpolateServerURL, isValidServerHost } from '../util/server';
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

/**
 * Identify the API an operation belongs to by the hosts its servers resolve to, with their
 * variables' defaults. Raw templates such as `{host}/v1` would make unrelated APIs collide.
 * Returns null when no server resolves to a concrete host: nothing may be shared then.
 */
export function getTryItApiScope(servers: OpenAPIV3.ServerObject[]): string | null {
    const hosts = new Set<string>();
    for (const server of servers) {
        const host = resolveHost(interpolateServerURL(server));
        if (host) {
            hosts.add(host);
        }
    }
    return hosts.size > 0 ? Array.from(hosts).sort().join(' ') : null;
}

function resolveHost(url: string): string | null {
    if (!isValidServerHost(url)) {
        return null;
    }
    try {
        const { host } = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
        return host && !host.includes('{') ? host : null;
    } catch {
        return null;
    }
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
