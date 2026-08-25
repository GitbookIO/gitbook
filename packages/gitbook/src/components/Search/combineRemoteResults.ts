import type { OrderedComputedResult } from './search-types';

const RRF_K = 60;

/** At displayed result depths, a 1% weight favors equal current-space ranks, not adjacent ranks. */
export const CURRENT_SITE_SPACE_RRF_WEIGHT = 1.01;

type RankedCandidate = {
    result: OrderedComputedResult;
    fusionScore: number;
    inputOrder: number;
};

/** Combine disjoint search scopes by rank without comparing their non-comparable BM25 scores. */
export function combineRemoteResults(
    currentSpaceResults: OrderedComputedResult[],
    otherSpacesResults: OrderedComputedResult[]
): OrderedComputedResult[] {
    const rankedPages: RankedCandidate[] = [];
    const context: OrderedComputedResult[] = [];

    addResults(currentSpaceResults, CURRENT_SITE_SPACE_RRF_WEIGHT);
    addResults(otherSpacesResults, 1);

    rankedPages.sort(
        (left, right) => right.fusionScore - left.fusionScore || left.inputOrder - right.inputOrder
    );

    return [...rankedPages.map(({ result }) => result), ...context];

    function addResults(results: OrderedComputedResult[], weight: number) {
        for (const result of results) {
            if (result.type === 'record') {
                context.push(result);
                continue;
            }

            rankedPages.push({
                result,
                fusionScore: weight / (RRF_K + result.rank),
                inputOrder: rankedPages.length,
            });
        }
    }
}
