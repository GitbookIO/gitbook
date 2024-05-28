const CODE_HIGHLIGHT_BLOCK_LIMIT = 50;

/**
 * Spaces where we'll always use plain highlighting.
 */
const PLAIN_HIGHLIGHTING_SPACES: string[] = [
    'V9geAO9ITPi8WOYK5o0r',
    'puRmcwVxGFtHph8IjXaf',
    'e3jwbMOrr4RhKtZ9C0XL',
    'ryjzVNizLfd6pYogN3dm',
];

/**
 * Protect against memory issues when highlighting a large number of code blocks.
 * This context only allows 50 code blocks per render to be highlighted.
 * Once highlighting can scale up to a large number of code blocks, it can be removed.
 *
 * https://linear.app/gitbook-x/issue/RND-3588/gitbook-open-code-syntax-highlighting-runs-out-of-memory-after-a
 */
export function createHighlightingContext() {
    let count = 0;
    return (spaceId?: string | undefined) => {
        if (!spaceId || PLAIN_HIGHLIGHTING_SPACES.includes(spaceId)) {
            return false;
        }

        count += 1;
        return count < CODE_HIGHLIGHT_BLOCK_LIMIT;
    };
}
