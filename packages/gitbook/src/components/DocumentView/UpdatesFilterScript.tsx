'use client';

import { useServerInsertedHTML } from 'next/navigation';
import { useRef } from 'react';

import {
    UPDATES_FILTER_KEY_ATTR,
    UPDATES_FILTER_SEARCH_PARAM,
    UPDATES_TAG_FILTER_ATTR,
    UPDATES_TAG_FILTER_CAP,
    updatesFilterStyleKey,
} from '@/lib/updates';

/**
 * Mirrors the `?tag=` search params onto `<html>` as `data-updates-tag-filter`, before first paint,
 * so the generated CSS can filter with no flash. Also stamps the filter style key.
 *
 * NOTE: stringified and injected as an inline script — must be self-contained, touching only
 * `document.documentElement` and `window.location`.
 */
export function applyUpdatesFilterScript(
    searchParam: string,
    attribute: string,
    cap: number,
    availableTags: string[],
    keyAttribute: string,
    styleKey: string
) {
    const el = document.documentElement;
    el.setAttribute(keyAttribute, styleKey);

    try {
        const validTags = new Set(availableTags);
        const params = new URLSearchParams(window.location.search);
        const seen = new Set<string>();
        const slugs: string[] = [];

        for (const value of params.getAll(searchParam)) {
            const slug = value.trim();
            if (!slug || seen.has(slug) || slugs.length >= cap || !validTags.has(slug)) {
                continue;
            }
            seen.add(slug);
            slugs.push(slug);
        }

        if (slugs.length > 0) {
            el.setAttribute(attribute, slugs.join(' '));
        } else {
            el.removeAttribute(attribute);
        }
    } catch {
        // Malformed URL — fall through, so the generated CSS's default (show everything) applies.
    }
}

/**
 * Inline script that applies the URL's `?tag=` filter to `<html>` before first paint. Rendered only
 * on pages with filterable updates (see SitePage), not globally.
 */
export function UpdatesFilterScript(props: { tagSlugs: string[] }) {
    const { tagSlugs } = props;
    const inserted = useRef(false);
    const scriptArgs = serializeUpdatesFilterScriptArgs([
        UPDATES_FILTER_SEARCH_PARAM,
        UPDATES_TAG_FILTER_ATTR,
        UPDATES_TAG_FILTER_CAP,
        tagSlugs,
        UPDATES_FILTER_KEY_ATTR,
        updatesFilterStyleKey(tagSlugs),
    ]);

    // Only needed for the initial document — client navs are handled by UpdatesFilterProvider.
    useServerInsertedHTML(() => {
        if (inserted.current) {
            return null;
        }
        inserted.current = true;

        return (
            <script
                dangerouslySetInnerHTML={{
                    __html: `(${applyUpdatesFilterScript.toString()})(${scriptArgs})`,
                }}
            />
        );
    });

    return null;
}

/** Serialize arguments without allowing revision data to terminate the surrounding script tag. */
export function serializeUpdatesFilterScriptArgs(args: unknown[]): string {
    return JSON.stringify(args).replaceAll('<', '\\u003c').slice(1, -1);
}
