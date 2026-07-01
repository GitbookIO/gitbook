/**
 * Return the highest-scoring item in the list, or undefined when empty.
 */
export function getBestScoredResult<T extends { score: number }>(
    items: readonly T[]
): T | undefined {
    return items.reduce<T | undefined>(
        (best, item) => (best === undefined || item.score > best.score ? item : best),
        undefined
    );
}
