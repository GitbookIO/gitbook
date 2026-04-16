import type { ComputedPageResult, OrderedComputedResult } from './search-types';
import type { LocalPageResult } from './useLocalSearchResults';

/** 
 * Jaro-Winkler similarity between two strings, in the range [0, 1].
 * Higher is more similar. 1 means an exact match.
 * https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance
 */
function jaroWinkler(s1: string, s2: string, p = 0.1): number {
    if (s1 === s2) return 1;
    const len1 = s1.length;
    const len2 = s2.length;
    if (len1 === 0 || len2 === 0) return 0;

    const maxDist = Math.floor(Math.max(len1, len2) / 2) - 1;

    const matched1 = new Array<boolean>(len1);
    const matched2 = new Array<boolean>(len2);
    for (let i = 0; i < len1; i++) matched1[i] = false;
    for (let i = 0; i < len2; i++) matched2[i] = false;

    let matches = 0;

    for (let i = 0; i < len1; i++) {
        const start = Math.max(0, i - maxDist);
        const end = Math.min(len2 - 1, i + maxDist);

        for (let j = start; j <= end; j++) {
            if (!matched2[j] && s1.charCodeAt(i) === s2.charCodeAt(j)) {
                matched1[i] = true;
                matched2[j] = true;
                matches++;
                break;
            }
        }
    }

    if (matches === 0) return 0;

    let t = 0;
    let k = 0;

    for (let i = 0; i < len1; i++) {
        if (!matched1[i]) continue;
        while (!matched2[k]) k++;
        if (s1.charCodeAt(i) !== s2.charCodeAt(k)) t++;
        k++;
    }

    const transpositions = t / 2;
    const m = matches;
    const jaro = (m / len1 + m / len2 + (m - transpositions) / m) / 3;

    let prefix = 0;
    const maxPrefix = 4;
    const minLen = Math.min(len1, len2);
    for (let i = 0; i < maxPrefix && i < minLen; i++) {
        if (s1.charCodeAt(i) === s2.charCodeAt(i)) prefix++;
        else break;
    }

    return jaro + prefix * p * (1 - jaro);
}

/** Standard RRF constant — moderates the impact of high-ranked items. */
const RRF_K = 60;
/** Lower k for local results gives them a slightly higher score than remote ones at the same rank. */
const RRF_K_LOCAL = 50;

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
 *
 * Additionally, a Jaro-Winkler title-match bonus is applied per query word:
 * for each query word that appears as a substring in the title, the best
 * Jaro-Winkler similarity score against any individual title word is added.
 */
export function reciprocalRankFusion(
    localResults: LocalPageResult[],
    remoteResults: OrderedComputedResult[],
    query: string
): Array<RRFResult> {
    // Map from dedup key → { result, score }
    const scoreMap = new Map<string, { result: RRFResult; score: number }>();

    // Process local results first (1-indexed rank)
    // Using RRF_K_LOCAL (< RRF_K) slightly boosts local scores over remote ones.
    localResults.forEach((result, index) => {
        const rank = index + 1;
        const key = getResultKey(result);
        const contribution = 1 / (RRF_K_LOCAL + rank);

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

    // Apply a title-match bonus per query word using Jaro-Winkler similarity.
    // For each query word that appears (as a substring) in the title, compute the
    // best Jaro-Winkler score against individual title words and add it to the score.
    const queryWords = query
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 0);

    if (queryWords.length > 0) {
        for (const entry of scoreMap.values()) {
            const title = entry.result.title?.toLowerCase() ?? '';
            const titleWords = title.split(/\s+/).filter((w) => w.length > 0);
            for (const word of queryWords) {
                // Only apply when there is at least a substring match in the title.
                if (!title.includes(word)) continue;
                let best = 0;
                for (const titleWord of titleWords) {
                    const sim = jaroWinkler(word, titleWord);
                    if (sim > best) best = sim;
                }
                entry.score += best;
            }
        }
    }

    // Sort descending by RRF score
    return Array.from(scoreMap.values())
        .sort((a, b) => b.score - a.score)
        .map(({ result }) => result);
}
