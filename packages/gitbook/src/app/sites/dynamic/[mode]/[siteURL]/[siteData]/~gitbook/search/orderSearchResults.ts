type RankedPageResult<TResult> = {
    rank: number | undefined;
    result: TResult;
};

export type SearchResultGroup<TResult> =
    | { type: 'pages'; results: RankedPageResult<TResult>[] }
    | { type: 'context'; results: TResult[] };

/** Reconstruct the backend's global page order after it grouped results by space. */
export function orderSearchResultGroups<TResult>(groups: SearchResultGroup<TResult>[]): TResult[] {
    const pages: (RankedPageResult<TResult> & { inputOrder: number })[] = [];
    const context: TResult[] = [];

    for (const group of groups) {
        if (group.type === 'pages') {
            const inputOffset = pages.length;
            pages.push(
                ...group.results.map((entry, index) => ({
                    ...entry,
                    inputOrder: inputOffset + index,
                }))
            );
        } else {
            context.push(...group.results);
        }
    }

    pages.sort((left, right) => {
        if (left.rank === undefined && right.rank === undefined) {
            return left.inputOrder - right.inputOrder;
        }
        if (left.rank === undefined) {
            return 1;
        }
        if (right.rank === undefined) {
            return -1;
        }

        return left.rank - right.rank || left.inputOrder - right.inputOrder;
    });

    return [...pages.map(({ result }) => result), ...context];
}
