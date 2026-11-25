import type { OpenAPIV3 } from '@gitbook/openapi-parser';

import { isFormData } from '../contentTypeChecks';
import type { OpenAPICustomSecurityScheme } from '../types';
import type { TryItPrefillAuthValue } from '../util/tryit-prefill';
import type { TryItMediaType, TryItOperation, TryItParameter } from './types';

/** Values typed by the reader, keyed by `fieldKey`/`authKey`. */
export interface TryItValues {
    server: OpenAPIV3.ServerObject | undefined;
    serverVariables: Record<string, string>;
    /** Schemes of the selected security option. */
    schemes: [string, OpenAPICustomSecurityScheme][];
    auth: Record<string, string>;
    parameters: Record<string, string>;
    /** Checkbox state of optional parameters, by `fieldKey`; unset means checked. */
    enabledParameters?: Record<string, boolean>;
    mediaType: TryItMediaType | undefined;
    bodyText: string;
    bodyFields: Record<string, string>;
    bodyFiles: Record<string, File[]>;
    /** Headers and query parameters the spec doesn't declare, added by the reader. */
    extraParameters?: TryItExtraParameter[];
}

export interface TryItExtraParameter {
    /** Stable React key for the row. */
    id?: number;
    in: 'header' | 'query';
    name: string;
    value: string;
    /** Unset means checked. */
    enabled?: boolean;
}

export interface TryItRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string | FormData | URLSearchParams | File | undefined;
    /** Cookies can't be set from the browser; only the proxy can forward them. */
    cookies: string;
    /** Labels of the required fields left empty. */
    missing: string[];
}

export function fieldKey(parameter: Pick<TryItParameter, 'in' | 'name'>) {
    return `${parameter.in}:${parameter.name}`;
}

export function authKey(scheme: string, part: 'value' | 'username' | 'password' = 'value') {
    return `${scheme}:${part}`;
}

/** Turn prefilled auth into initial input values. */
export function prefillAuthValues(
    securitySchemes: Record<string, TryItPrefillAuthValue> | undefined
): Record<string, string> {
    const values: Record<string, string> = {};
    for (const [scheme, value] of Object.entries(securitySchemes ?? {})) {
        if ('token' in value) {
            values[authKey(scheme)] = value.token;
        } else if ('username' in value) {
            values[authKey(scheme, 'username')] = value.username ?? '';
            values[authKey(scheme, 'password')] = value.password ?? '';
        } else {
            values[authKey(scheme)] = value.value;
        }
    }
    return values;
}

export function resolveServerURL(
    server: OpenAPIV3.ServerObject | undefined,
    variables: Record<string, string>
): string {
    if (!server?.url) {
        return '';
    }
    const url = server.url.replace(/{([^}]+)}/g, (match, name: string) => {
        return variables[name] ?? server.variables?.[name]?.default?.toString() ?? match;
    });
    // `hasValidServerHost` also accepts a bare host (`api.example.com`); default those to HTTPS.
    const absolute = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return absolute.replace(/\/+$/, '');
}

/**
 * Build the HTTP request from the operation and what the reader typed.
 */
export function buildTryItRequest(operation: TryItOperation, values: TryItValues): TryItRequest {
    const missing: string[] = [];
    const headers: Record<string, string> = {};
    const query = new URLSearchParams();
    const cookies: string[] = [];

    let path = operation.path;
    for (const parameter of operation.parameters) {
        const key = fieldKey(parameter);
        if (!parameter.required && values.enabledParameters?.[key] === false) {
            continue;
        }
        const value = values.parameters[key] ?? '';
        if (value === '') {
            if (parameter.required) {
                missing.push(parameter.name);
            }
            continue;
        }
        switch (parameter.in) {
            case 'path':
                path = path.replaceAll(`{${parameter.name}}`, encodeURIComponent(value));
                break;
            case 'query':
                if (parameter.explode) {
                    for (const item of value.split(',')) {
                        query.append(parameter.name, item.trim());
                    }
                } else {
                    query.append(parameter.name, value);
                }
                break;
            case 'header':
                setHeader(headers, parameter.name, value);
                break;
            case 'cookie':
                cookies.push(`${parameter.name}=${encodeURIComponent(value)}`);
                break;
        }
    }

    for (const extra of values.extraParameters ?? []) {
        const name = extra.name.trim();
        if (!name || extra.enabled === false) {
            continue;
        }
        if (extra.in === 'header') {
            setHeader(headers, name, extra.value);
        } else {
            query.append(name, extra.value);
        }
    }

    for (const [name, scheme] of values.schemes) {
        applyAuth(name, scheme, values.auth, { headers, query, cookies });
    }

    const { body, contentType } = buildBody(values, missing, operation.body?.required ?? false);
    if (contentType && !hasHeader(headers, 'content-type')) {
        headers['Content-Type'] = contentType;
    }

    const search = query.toString();
    return {
        url: `${resolveServerURL(values.server, values.serverVariables)}${path}${search ? `?${search}` : ''}`,
        method: operation.method.toUpperCase(),
        headers,
        body,
        cookies: cookies.join('; '),
        missing,
    };
}

function applyAuth(
    name: string,
    scheme: OpenAPICustomSecurityScheme,
    auth: Record<string, string>,
    target: { headers: Record<string, string>; query: URLSearchParams; cookies: string[] }
) {
    switch (scheme.type) {
        case 'http': {
            const httpScheme = scheme.scheme?.toLowerCase() ?? '';
            if (httpScheme.includes('basic')) {
                const username = auth[authKey(name, 'username')] ?? '';
                const password = auth[authKey(name, 'password')] ?? '';
                if (username || password) {
                    setHeader(
                        target.headers,
                        'Authorization',
                        `Basic ${encodeBase64(`${username}:${password}`)}`
                    );
                }
                return;
            }
            const token = auth[authKey(name)];
            if (token) {
                const prefix = httpScheme.includes('bearer')
                    ? 'Bearer'
                    : (scheme.scheme ?? 'Bearer');
                setHeader(target.headers, 'Authorization', `${prefix} ${token}`);
            }
            return;
        }
        case 'apiKey': {
            const value = auth[authKey(name)];
            if (!value || !scheme.name) {
                return;
            }
            const prefix = scheme['x-gitbook-prefix'];
            const full = prefix ? `${prefix} ${value}` : value;
            if (scheme.in === 'query') {
                target.query.append(scheme.name, full);
            } else if (scheme.in === 'cookie') {
                target.cookies.push(`${scheme.name}=${encodeURIComponent(full)}`);
            } else {
                setHeader(target.headers, scheme.name, full);
            }
            return;
        }
        case 'oauth2':
        case 'openIdConnect': {
            const token = auth[authKey(name)];
            if (token) {
                setHeader(
                    target.headers,
                    'Authorization',
                    `${scheme['x-gitbook-prefix'] ?? 'Bearer'} ${token}`
                );
            }
            return;
        }
    }
}

function buildBody(
    values: TryItValues,
    missing: string[],
    required: boolean
): { body: TryItRequest['body']; contentType?: string } {
    const { mediaType } = values;
    if (!mediaType) {
        return { body: undefined };
    }

    switch (mediaType.kind) {
        case 'raw': {
            if (values.bodyText.trim() === '') {
                if (required) {
                    missing.push('body');
                }
                return { body: undefined };
            }
            return {
                body: values.bodyText,
                // A multipart Content-Type without its boundary would make the body unparseable.
                contentType: isFormData(mediaType.mediaType) ? undefined : mediaType.mediaType,
            };
        }
        case 'binary': {
            const file = values.bodyFiles['']?.[0];
            if (!file) {
                if (required) {
                    missing.push('body');
                }
                return { body: undefined };
            }
            return { body: file, contentType: mediaType.mediaType };
        }
        case 'form': {
            const form = new URLSearchParams();
            for (const field of mediaType.fields) {
                const value = values.bodyFields[field.name] ?? '';
                if (value === '') {
                    if (field.required) {
                        missing.push(field.name);
                    }
                    continue;
                }
                form.append(field.name, value);
            }
            return { body: form, contentType: mediaType.mediaType };
        }
        case 'multipart': {
            const form = new FormData();
            for (const field of mediaType.fields) {
                if (field.binary) {
                    const files = values.bodyFiles[field.name] ?? [];
                    if (files.length === 0 && field.required) {
                        missing.push(field.name);
                    }
                    for (const file of files) {
                        form.append(field.name, file);
                    }
                    continue;
                }
                const value = values.bodyFields[field.name] ?? '';
                if (value === '') {
                    if (field.required) {
                        missing.push(field.name);
                    }
                    continue;
                }
                form.append(field.name, value);
            }
            // No Content-Type: the browser has to add the multipart boundary itself.
            return { body: form };
        }
    }
}

/** Route the request through GitBook's proxy, for APIs that don't allow CORS. */
export function toProxyRequest(request: TryItRequest, proxyUrl: string): TryItRequest {
    const url = new URL(proxyUrl);
    url.searchParams.set('scalar_url', request.url);
    const headers = { ...request.headers };
    if (request.cookies) {
        headers['X-Scalar-Cookie'] = request.cookies;
    }
    return { ...request, url: url.toString(), headers };
}

function hasHeader(headers: Record<string, string>, name: string) {
    return Object.keys(headers).some((key) => key.toLowerCase() === name);
}

/** Header names are case-insensitive; a later value (auth) replaces an earlier one. */
function setHeader(headers: Record<string, string>, name: string, value: string) {
    for (const key of Object.keys(headers)) {
        if (key.toLowerCase() === name.toLowerCase()) {
            delete headers[key];
        }
    }
    headers[name] = value;
}

function encodeBase64(value: string) {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    for (let index = 0; index < bytes.length; index++) {
        binary += String.fromCharCode(bytes[index] ?? 0);
    }
    return btoa(binary);
}
