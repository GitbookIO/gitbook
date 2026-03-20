import type { OrderedComputedResult } from './search-types';
import type { LocalPageResult } from './useLocalSearchResults';

/** Standard RRF constant — moderates the impact of high-ranked items. */
const RRF_K = 60;

/**
 * Derive a stable deduplication key for any result type.
 * Pages from both local and remote share the same `page:` namespace so they
 * can be deduplicated against each other.
 */
export function getResultKey(result: LocalPageResult | OrderedComputedResult): string {
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

/**
 * Merge local (FlexSearch) and remote (API) search results using
 * Reciprocal Rank Fusion (RRF).
 *
 * RRF formula: score(d) = Σ_i  1 / (k + rank_i(d))
 *
 * Pages present in both lists are deduplicated by matching the local result's
 * `id` against the remote `page` result's `pageId`. Their rank contributions
 * from both lists are summed, and the remote result is kept (richer metadata:
 * breadcrumbs, spaceId).
 *
 * Sections and records have no local equivalent and only accumulate their own
 * rank contribution.
 */
export function reciprocalRankFusion(
    localResults: LocalPageResult[],
    remoteResults: OrderedComputedResult[]
): Array<LocalPageResult | OrderedComputedResult> {
    // Map from dedup key → { result, score }
    const scoreMap = new Map<
        string,
        { result: LocalPageResult | OrderedComputedResult; score: number }
    >();

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

        // Determine the dedup key — pages match via pageId
        const key = getResultKey(result);

        const existing = scoreMap.get(key);
        if (existing) {
            // Page found in both lists: credit both rank contributions and
            // prefer the remote result which carries richer metadata.
            existing.score += contribution;
            existing.result = result;
        } else {
            scoreMap.set(key, { result, score: contribution });
        }
    });

    // Sort descending by RRF score
    return Array.from(scoreMap.values())
        .sort((a, b) => b.score - a.score)
        .map(({ result }) => result);
}
