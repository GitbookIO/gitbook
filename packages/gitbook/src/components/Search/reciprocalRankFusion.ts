import type { ComputedPageResult, OrderedComputedResult } from './search-types';
import type { LocalPageResult } from './useLocalSearchResults';

/** Standard RRF constant — moderates the impact of high-ranked items. */
const RRF_K = 60;

/**
 * A page result that was present in both local and remote lists.
 * Local fields (description, icon, emoji, pathname) are carried over as a base,
 * and remote fields (href, pageId, spaceId, title) override them.
 * Breadcrumbs prefer local (has icon + emoji) and fall back to remote.
 */
export type MergedPageResult = ComputedPageResult & {
    pathname?: string;
    icon?: string;
    emoji?: string;
    description?: string;
};

/**
 * Derive a stable deduplication key for any result type.
 * Pages from both local and remote share the same `page:` namespace so they
 * can be deduplicated against each other.
 */
export function getResultKey(
    result: LocalPageResult | OrderedComputedResult | MergedPageResult
): string {
    switch (result.type) {
        case 'local-page':
            return `page:${result.id}`;
        case 'page':
            return `page:${result.pageId}`;
        case 'section':
            return `section:${result.pageId}`;
        case 'record':
            return `record:${result.id}`;
    }
}

type RRFResult = LocalPageResult | OrderedComputedResult | MergedPageResult;

/**
 * Merge local (FlexSearch) and remote (API) search results using
 * Reciprocal Rank Fusion (RRF).
 *
 * RRF formula: score(d) = Σ_i  1 / (k + rank_i(d))
 *
 * Pages present in both lists are deep-merged: local fields act as the base
 * (preserving description, icon, emoji, pathname) and remote fields override
 * (providing href, pageId, spaceId, title). Breadcrumbs prefer local (has icon
 * + emoji) and fall back to remote. Their rank contributions from both lists are summed.
 *
 * Sections and records have no local equivalent and only accumulate their own
 * rank contribution.
 */
export function reciprocalRankFusion(
    localResults: LocalPageResult[],
    remoteResults: OrderedComputedResult[]
): Array<RRFResult> {
    // Map from dedup key → { result, score }
    const scoreMap = new Map<string, { result: RRFResult; score: number }>();

    // Process local results first (1-indexed rank)
    localResults.forEach((result, index) => {
        const rank = index + 1;
        const key = getResultKey(result);
        const contribution = 1 / (RRF_K + rank);

        const existing = scoreMap.get(key);
        if (existing) {
            existing.score += contribution;
        } else {
            scoreMap.set(key, { result, score: contribution });
        }
    });

    // Process remote results, deduplicating against local pages
    remoteResults.forEach((result, index) => {
        const rank = index + 1;
        const contribution = 1 / (RRF_K + rank);

        const key = getResultKey(result);

        const existing = scoreMap.get(key);
        if (existing) {
            // Page found in both lists: sum rank contributions and deep-merge.
            // Local is the base (description, icon, emoji, pathname), remote overrides
            // (href, pageId, spaceId, breadcrumbs, title).
            existing.score += contribution;
            if (existing.result.type === 'local-page' && result.type === 'page') {
                existing.result = {
                    ...existing.result,
                    ...result,
                    // Merge breadcrumbs: prefer local (has icon + emoji), fall back to remote.
                    breadcrumbs: existing.result.breadcrumbs ?? result.breadcrumbs,
                } as MergedPageResult;
            } else {
                existing.result = result;
            }
        } else {
            scoreMap.set(key, { result, score: contribution });
        }
    });

    // Sort descending by RRF score
    return Array.from(scoreMap.values())
        .sort((a, b) => b.score - a.score)
        .map(({ result }) => result);
}
