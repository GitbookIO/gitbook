/**
 * Whether the query targets the page itself (its title) rather than a specific
 * section within it. True when every word of the query appears in the page
 * title. We treat that as a page/title match so the result links to the top of
 * the page instead of dropping to a section anchor. Mirrors the per-word title
 * matching used for scoring in `reciprocalRankFusion`.
 */
export function isPageTitleMatch(query: string, title: string): boolean {
    const queryWords = query
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 0);

    if (queryWords.length === 0) {
        return false;
    }

    const normalizedTitle = title.toLowerCase();
    return queryWords.every((word) => normalizedTitle.includes(word));
}
