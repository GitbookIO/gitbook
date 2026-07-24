/**
 * Whether a search query matches a page by its title.
 *
 * There is no server-provided title-vs-section flag on search results, so we
 * infer a title match the same way title scoring does in `reciprocalRankFusion`:
 * a match when every whitespace-split query word appears (case-insensitively)
 * as a substring of the title.
 *
 * Used to decide whether a result should link to the top of the page (title
 * match) or keep its section anchor (section-level match).
 */
export function isPageTitleMatch(query: string, title: string): boolean {
    const queryWords = query
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 0);

    if (queryWords.length === 0) {
        return false;
    }

    const lowerTitle = title.toLowerCase();
    return queryWords.every((word) => lowerTitle.includes(word));
}
