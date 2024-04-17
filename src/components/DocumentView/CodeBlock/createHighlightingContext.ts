const CODE_HIGHLIGHT_BLOCK_LIMIT = 50;

/**
 * Protect against memory issues when highlighting a large number of code blocks.
 * This context only allows 50 code blocks per render to be highlighted.
 * Once highlighting can scale up to a large number of code blocks, it can be removed.
 *
 * https://linear.app/gitbook-x/issue/RND-3588/gitbook-open-code-syntax-highlighting-runs-out-of-memory-after-a
 */
export function createHighlightingContext() {
    let count = 0;
    return () => {
        count += 1;
        console.log(`Block #${count} / ${CODE_HIGHLIGHT_BLOCK_LIMIT}`)
        return count < CODE_HIGHLIGHT_BLOCK_LIMIT;
    };
}
