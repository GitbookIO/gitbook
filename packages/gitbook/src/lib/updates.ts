import type {
    DocumentBlock,
    DocumentBlockUpdate,
    DocumentBlockUpdates,
    DocumentInline,
    JSONDocument,
    Revision,
    RevisionTag,
} from '@gitbook/api';

import { getBlocksByType, hasMoreThan } from './document';
import { getRevisionTags, resolveBlockTags } from './tags';

export {
    UPDATES_FILTER_SEARCH_PARAM,
    UPDATES_MAX_PAGE,
    UPDATES_PAGE_SEARCH_PARAM,
    parseUpdatesPageParam,
} from './updates-url';

export const UPDATES_PAGINATION_THRESHOLD = 50;
export const UPDATES_PAGE_SIZE = 20;

export type UpdatesPageRange = {
    page: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    start: number;
    end: number;
    isClamped: boolean;
};

export type UpdatesPaginationSkipReason =
    | 'multiple-updates-blocks'
    | 'nested-updates-block'
    | 'non-update-entries';

export type UpdatesPaginationEligibility =
    | { status: 'eligible'; block: DocumentBlockUpdates; updates: DocumentBlockUpdate[] }
    | { status: 'below-threshold' }
    | {
          status: 'skipped';
          reason: UpdatesPaginationSkipReason;
          totalUpdates: number;
          updatesBlocks: number;
      };

/** Attribute on `<html>` with the active filter's tag slugs, space-separated (e.g. `"a b"`). */
export const UPDATES_TAG_FILTER_ATTR = 'data-updates-tag-filter';

/**
 * Attribute on `<html>` identifying which page's filter stylesheet is active (see
 * `updatesFilterStyleKey`) — scopes the generated CSS so a stale, hoisted stylesheet from a
 * previously visited page never matches the page that's actually mounted.
 */
export const UPDATES_FILTER_KEY_ATTR = 'data-updates-filter-key';

/** Attribute carrying an update entry's own tag slugs, space-separated. Read by the generated CSS. */
export const UPDATES_TAG_ATTR = 'data-update-tags';

/** Attribute carrying a "page contents" section's own tag slugs, space-separated (only set on sections that have tags). */
export const UPDATES_TAG_SECTION_ATTR = 'data-tag-section';

/** Safety cap on how many active tags are accepted from the URL or filter controls. */
export const UPDATES_TAG_FILTER_CAP = 20;

/** Keep in sync with the duplicated logic in `applyUpdatesFilterScript`. */
export function normalizeUpdatesFilterTags(
    tags: string[],
    availableTags: ReadonlySet<string>
): string[] {
    const next: string[] = [];
    const seen = new Set<string>();

    for (const value of tags) {
        const tag = value.trim();
        if (
            !tag ||
            seen.has(tag) ||
            next.length >= UPDATES_TAG_FILTER_CAP ||
            !availableTags.has(tag)
        ) {
            continue;
        }

        next.push(tag);
        seen.add(tag);
    }

    return next;
}

// Chip look variants (see TagChip in UpdatesFilter.tsx) — CSS-toggled, not React state, for a
// flash-free first paint.
/** Marks a chip's "selected" span variant, valued with its own tag slug. */
export const UPDATES_TAG_CHIP_SELECTED_ATTR = 'data-tag-chip-selected';
/** Marks a chip's "unselected, dimmed" span variant. */
export const UPDATES_TAG_CHIP_UNSELECTED_DIMMED_ATTR = 'data-tag-chip-unselected-dimmed';
/** Marks a chip's "unselected, plain" span variant — visible by default. */
export const UPDATES_TAG_CHIP_UNSELECTED_PLAIN_ATTR = 'data-tag-chip-unselected-plain';
/** Marks the "clear filter" button — hidden until a filter is active. */
export const UPDATES_TAG_CLEAR_ATTR = 'data-updates-tag-clear';

/**
 * Get the unique tags used by update entries in a document, preserving document order.
 */
export function getDocumentFilterableTags(
    document: JSONDocument,
    revision: Revision | undefined
): RevisionTag[] {
    const revisionTags = getRevisionTags(revision);
    const seen = new Set<string>();
    const tags: RevisionTag[] = [];

    for (const updatesBlock of getBlocksByType(document, 'updates')) {
        for (const updateBlock of updatesBlock.nodes) {
            if (updateBlock.type !== 'update') {
                continue;
            }

            for (const tag of resolveBlockTags(updateBlock.data.tags, revisionTags)) {
                if (seen.has(tag.slug)) {
                    continue;
                }

                tags.push(tag);
                seen.add(tag.slug);
            }
        }
    }

    return tags;
}

/**
 * Pagination only slices a document with a single top-level `updates` block made of more than
 * `UPDATES_PAGINATION_THRESHOLD` direct `update` entries.
 */
export function getUpdatesPaginationEligibility(
    document: JSONDocument
): UpdatesPaginationEligibility {
    let topLevelBlock: DocumentBlockUpdates | undefined;
    let topLevelBlockCount = 0;
    let totalUpdates = 0;

    for (const block of document.nodes) {
        if (block.type !== 'updates') {
            continue;
        }
        topLevelBlock ??= block;
        topLevelBlockCount++;
        totalUpdates += block.nodes.length;
    }

    if (!topLevelBlock || totalUpdates <= UPDATES_PAGINATION_THRESHOLD) {
        return { status: 'below-threshold' };
    }

    if (topLevelBlockCount > 1) {
        return {
            status: 'skipped',
            reason: 'multiple-updates-blocks',
            totalUpdates,
            updatesBlocks: topLevelBlockCount,
        };
    }

    const updates: DocumentBlockUpdate[] = [];
    for (const entry of topLevelBlock.nodes) {
        if (entry.type !== 'update') {
            return {
                status: 'skipped',
                reason: 'non-update-entries',
                totalUpdates,
                updatesBlocks: 1,
            };
        }
        updates.push(entry);
    }

    const allUpdatesBlocks = getBlocksByType(document, 'updates');
    if (allUpdatesBlocks.length > 1) {
        let allUpdatesCount = 0;
        for (const updatesBlock of allUpdatesBlocks) {
            allUpdatesCount += updatesBlock.nodes.length;
        }
        return {
            status: 'skipped',
            reason: 'nested-updates-block',
            totalUpdates: allUpdatesCount,
            updatesBlocks: allUpdatesBlocks.length,
        };
    }

    return { status: 'eligible', block: topLevelBlock, updates };
}

export function paginateUpdatesDocument(
    document: JSONDocument,
    revision: Revision | undefined,
    { page, tags }: { page: number; tags?: string[] }
): {
    document: JSONDocument;
    pagination: UpdatesPageRange | null;
    eligibility: UpdatesPaginationEligibility;
} {
    const eligibility = getUpdatesPaginationEligibility(document);
    if (eligibility.status !== 'eligible') {
        return { document, pagination: null, eligibility };
    }

    const matching = filterUpdates(eligibility.updates, document, revision, tags);
    const pagination = getUpdatesPageRange(page, matching.length);
    const entries = matching.slice(pagination.start - 1, pagination.end);
    const nodes: JSONDocument['nodes'] = [];

    for (const block of document.nodes) {
        if (block !== eligibility.block) {
            nodes.push(block);
            continue;
        }

        if (entries.length > 0) {
            nodes.push({ ...block, nodes: entries });
        }
    }

    return { document: { ...document, nodes }, pagination, eligibility };
}

export function getUpdatesPageRange(requestedPage: number, totalItems: number): UpdatesPageRange {
    const totalPages = Math.max(1, Math.ceil(totalItems / UPDATES_PAGE_SIZE));
    const page = Math.min(Math.max(1, requestedPage), totalPages);
    let start = (page - 1) * UPDATES_PAGE_SIZE + 1;
    if (totalItems === 0) {
        start = 0;
    }

    return {
        page,
        totalPages,
        totalItems,
        pageSize: UPDATES_PAGE_SIZE,
        start,
        end: Math.min(page * UPDATES_PAGE_SIZE, totalItems),
        isClamped: page !== requestedPage,
    };
}

export function findUpdateAnchorPage(
    document: JSONDocument,
    revision: Revision | undefined,
    { anchor, tags }: { anchor: string; tags?: string[] }
): { found: true; page: number | null; clearTags: boolean } | { found: false } {
    const eligibility = getUpdatesPaginationEligibility(document);
    if (eligibility.status !== 'eligible') {
        if (hasMoreThan(document, (node) => matchesUpdateAnchor(node, anchor), 0)) {
            return { found: true, page: null, clearTags: false };
        }
        return { found: false };
    }

    const { updates } = eligibility;
    const index = updates.findIndex((update) =>
        hasMoreThan(update, (node) => matchesUpdateAnchor(node, anchor), 0)
    );
    const entry = updates[index];
    if (!entry) {
        return { found: false };
    }

    const filteredIndex = filterUpdates(updates, document, revision, tags).indexOf(entry);
    if (filteredIndex >= 0) {
        return {
            found: true,
            page: Math.floor(filteredIndex / UPDATES_PAGE_SIZE) + 1,
            clearTags: false,
        };
    }

    return { found: true, page: Math.floor(index / UPDATES_PAGE_SIZE) + 1, clearTags: true };
}

function matchesUpdateAnchor(node: DocumentBlock | DocumentInline, anchor: string): boolean {
    if (node.object !== 'block') {
        return false;
    }
    if ('meta' in node && node.meta && 'id' in node.meta && node.meta.id === anchor) {
        return true;
    }
    if (node.type === 'tabs-item' && !node.meta?.id && node.key === anchor) {
        return true;
    }
    return false;
}

function filterUpdates(
    updates: DocumentBlockUpdate[],
    document: JSONDocument,
    revision: Revision | undefined,
    tags: string[] | undefined
): DocumentBlockUpdate[] {
    if (!tags?.length) {
        return updates;
    }

    const availableTags = new Set(
        getDocumentFilterableTags(document, revision).map((tag) => tag.slug)
    );
    const selectedTags = new Set(normalizeUpdatesFilterTags(tags, availableTags));
    if (!selectedTags.size) {
        return updates;
    }

    const revisionTags = getRevisionTags(revision);
    return updates.filter((update) =>
        resolveBlockTags(update.data.tags, revisionTags).some((tag) => selectedTags.has(tag.slug))
    );
}

/**
 * Escape a slug for interpolation into a CSS string literal (a quoted attribute-selector value).
 */
function escapeCssString(value: string): string {
    return value.replace(/["\\]/g, '\\$&');
}

// FNV-1a (32-bit) constants — see https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
const FNV_OFFSET_BASIS_32 = 0x811c9dc5;
const FNV_PRIME_32 = 0x01000193;

/** Stable, order-independent identifier for a page's set of filterable tags. */
export function updatesFilterStyleKey(tagSlugs: string[]): string {
    const key = [...new Set(tagSlugs)].sort().join(' ');
    let hash = FNV_OFFSET_BASIS_32;
    for (let i = 0; i < key.length; i++) {
        hash ^= key.charCodeAt(i);
        hash = Math.imul(hash, FNV_PRIME_32);
    }
    return (hash >>> 0).toString(36);
}

/** React dedupes/hoists `<style href>` tags by this value, so each tag set needs its own href. */
export function updatesFilterStyleHref(tagSlugs: string[]): string {
    return `gb-updates-filter-${updatesFilterStyleKey(tagSlugs)}`;
}

/**
 * Generate the CSS that filters `updates` entries, "page contents" sections, and tag-filter chips by
 * the active `?tag=` filter, purely via attribute selectors — so filtering applies before hydration
 * even though the page's HTML doesn't vary by query string. Byte-identical per page, no cache impact.
 */
export function generateUpdatesFilterCSS(tagSlugs: RevisionTag['slug'][]): string {
    const slugs = [...new Set(tagSlugs.filter(Boolean))];
    if (slugs.length === 0) {
        return '';
    }

    const key = escapeCssString(updatesFilterStyleKey(tagSlugs));
    // Scoped behind this page's own key so a stale, hoisted stylesheet from another page never matches.
    const scope = `html[${UPDATES_FILTER_KEY_ATTR}="${key}"]`;
    const entry = `[${UPDATES_TAG_ATTR}]`;
    const section = `[${UPDATES_TAG_SECTION_ATTR}]`;
    // Leaves the `[` dangling — only ever used as `${scope}[${filtering} …` or `…:not(…`.
    const filtering = `${UPDATES_TAG_FILTER_ATTR}]:not([${UPDATES_TAG_FILTER_ATTR}=""])`;
    const rules = [
        `${scope}[${filtering} ${entry}{display:none}`,
        `${scope}[${filtering} ${section}{display:none}`,
        `${scope}[${filtering} [${UPDATES_TAG_CHIP_UNSELECTED_PLAIN_ATTR}]{display:none}`,
        `${scope}[${filtering} [${UPDATES_TAG_CLEAR_ATTR}]{visibility:visible;pointer-events:auto}`,
    ];

    for (const slug of slugs) {
        const value = escapeCssString(slug);
        rules.push(
            // `flex`, not `revert`, to match the entry's/section's own layout class.
            `${scope}[${UPDATES_TAG_FILTER_ATTR}~="${value}"] ${entry}[${UPDATES_TAG_ATTR}~="${value}"]{display:flex}`,
            `${scope}[${UPDATES_TAG_FILTER_ATTR}~="${value}"] ${section}[${UPDATES_TAG_SECTION_ATTR}~="${value}"]{display:flex}`,
            `${scope}[${UPDATES_TAG_FILTER_ATTR}~="${value}"] [${UPDATES_TAG_CHIP_SELECTED_ATTR}="${value}"]{display:inline-flex}`,
            `${scope}[${filtering}:not([${UPDATES_TAG_FILTER_ATTR}~="${value}"]) [${UPDATES_TAG_CHIP_UNSELECTED_DIMMED_ATTR}="${value}"]{display:inline-flex}`
        );
    }

    return rules.join('');
}
