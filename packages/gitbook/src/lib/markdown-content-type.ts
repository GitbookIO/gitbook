/**
 * ChatGPT currently rejects text/markdown responses, so use text/plain for its Markdown output.
 * See RND-12762: https://linear.app/gitbook-x/issue/RND-12762/chatgpt-cant-read-docs-on-gitbook
 */
export function getMarkdownContentType(isChatGPT?: boolean): string {
    return isChatGPT ? 'text/plain; charset=utf-8' : 'text/markdown; charset=utf-8';
}
