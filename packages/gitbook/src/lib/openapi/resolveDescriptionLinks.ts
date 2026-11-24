import { type DefaultTreeAdapterMap, parseFragment } from 'parse5';
import * as React from 'react';

import type { ContentRef } from '@gitbook/api';
import type { Filesystem, OpenAPIV3xDocument } from '@gitbook/openapi-parser';

import { escapeHTML } from '@/lib/html';
import { resolveStringContentRef } from '@/lib/references';

const DESCRIPTION_HTML_KEY = 'x-gitbook-description-html';
// Slate JSON, which never holds description HTML: skipped to keep the walk short.
const DESCRIPTION_DOCUMENT_KEY = 'x-gitbook-description-document';
// Set by spec processing on links to GitBook content, e.g. `/spaces/{space}/pages/{page}`.
const CONTENT_REF_ATTRIBUTE = 'data-gitbook-ref';

type OpenAPIFilesystem = Filesystem<OpenAPIV3xDocument>;
type ResolveContentRef = (ref: ContentRef) => Promise<{ href: string } | null>;

// Per request: resolved hrefs depend on the site being rendered.
const getResolvedFilesystems = React.cache(
    () => new WeakMap<OpenAPIFilesystem, Promise<OpenAPIFilesystem>>()
);

/**
 * Point description links that spec processing tagged with a content ref at their URL in the
 * current site. Links whose ref doesn't resolve keep the href written in the spec.
 * Returns a copy when something changed: the input may be shared through the data cache.
 */
export function resolveOpenAPIDescriptionLinks(
    filesystem: OpenAPIFilesystem,
    resolveContentRef: ResolveContentRef
): Promise<OpenAPIFilesystem> {
    const resolvedFilesystems = getResolvedFilesystems();
    let promise = resolvedFilesystems.get(filesystem);
    if (!promise) {
        promise = baseResolveOpenAPIDescriptionLinks(filesystem, resolveContentRef);
        resolvedFilesystems.set(filesystem, promise);
    }
    return promise;
}

async function baseResolveOpenAPIDescriptionLinks(
    filesystem: OpenAPIFilesystem,
    resolveContentRef: ResolveContentRef
): Promise<OpenAPIFilesystem> {
    // Tagged HTML → its rewritten version, filled in once the refs resolve.
    const rewritten = new Map<string, string>();
    mapDescriptionHTML(filesystem, (html) => {
        if (html.includes(CONTENT_REF_ATTRIBUTE)) {
            rewritten.set(html, html);
        }
        return html;
    });

    if (rewritten.size === 0) {
        return filesystem;
    }

    const hrefs = new Map<string, Promise<string | null>>();
    const resolveHref = (source: string) => {
        let href = hrefs.get(source);
        if (!href) {
            const ref = resolveStringContentRef(source);
            href = ref
                ? resolveContentRef(ref).then((resolved) => resolved?.href ?? null)
                : Promise.resolve(null);
            hrefs.set(source, href);
        }
        return href;
    };

    await Promise.all(
        Array.from(rewritten.keys(), async (html) => {
            rewritten.set(html, await rewriteLinks(html, resolveHref));
        })
    );

    return mapDescriptionHTML(filesystem, (html) => rewritten.get(html) ?? html);
}

/**
 * Replace the href of each tagged link with its resolved URL.
 */
async function rewriteLinks(
    html: string,
    resolveHref: (source: string) => Promise<string | null>
): Promise<string> {
    const fragment = parseFragment(html, { sourceCodeLocationInfo: true });
    const replacements: { start: number; end: number; value: string }[] = [];

    await Promise.all(
        collectLinks(fragment).map(async (link) => {
            const source = link.attrs.find((attr) => attr.name === CONTENT_REF_ATTRIBUTE)?.value;
            const location = link.sourceCodeLocation?.attrs?.href;
            if (!source || !location) {
                return;
            }

            const href = await resolveHref(source);
            if (href) {
                replacements.push({
                    start: location.startOffset,
                    end: location.endOffset,
                    value: `href="${escapeHTML(href)}"`,
                });
            }
        })
    );

    // Apply from the end so earlier offsets stay valid.
    replacements.sort((a, b) => b.start - a.start);
    let result = html;
    for (const { start, end, value } of replacements) {
        result = result.slice(0, start) + value + result.slice(end);
    }
    return result;
}

function collectLinks(
    node: DefaultTreeAdapterMap['node'],
    links: DefaultTreeAdapterMap['element'][] = []
): DefaultTreeAdapterMap['element'][] {
    if ('tagName' in node && node.tagName === 'a') {
        links.push(node);
    }
    if ('childNodes' in node) {
        for (const child of node.childNodes) {
            collectLinks(child, links);
        }
    }
    return links;
}

/**
 * Map every description HTML in a JSON value, copying only the objects on a changed path.
 */
function mapDescriptionHTML<T>(value: T, transform: (html: string) => string): T {
    if (typeof value !== 'object' || value === null) {
        return value;
    }

    if (Array.isArray(value)) {
        let result: unknown[] | null = null;
        for (let index = 0; index < value.length; index++) {
            const item = value[index];
            const next = mapDescriptionHTML(item, transform);
            if (next !== item) {
                result ??= [...value];
                result[index] = next;
            }
        }
        return (result ?? value) as T;
    }

    const record = value as Record<string, unknown>;
    let result: Record<string, unknown> | null = null;
    // `for...in` over plain JSON objects: several times faster than `Object.entries` on large specs.
    for (const key in record) {
        if (key === DESCRIPTION_DOCUMENT_KEY) {
            continue;
        }
        const child = record[key];
        const next =
            key === DESCRIPTION_HTML_KEY && typeof child === 'string'
                ? transform(child)
                : mapDescriptionHTML(child, transform);
        if (next !== child) {
            result ??= { ...record };
            result[key] = next;
        }
    }
    return (result ?? record) as T;
}
