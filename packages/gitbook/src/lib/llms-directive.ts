import type { RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';
import type { GitBookSiteContext } from './context';

/**
 * Return the URL for the site-level llms.txt file.
 */
export function getLLMsTxtURL(context: GitBookSiteContext): string {
    return context.linker.toAbsoluteURL(context.linker.toPathInSite('llms.txt'));
}

/**
 * Return the URL for the markdown version of a page.
 */
export function getPageMarkdownURL(
    context: GitBookSiteContext,
    page: RevisionPageDocument | RevisionPageGroup
): string {
    return `${context.linker.toAbsoluteURL(context.linker.toPathInSpace(page.path))}.md`;
}

/**
 * Render the agent-facing directive that points agents to the site index.
 */
export function renderLLMsTxtMarkdownDirective(
    context: GitBookSiteContext,
    page: RevisionPageDocument | RevisionPageGroup
): string {
    return `> For the complete documentation index, see [llms.txt](${getLLMsTxtURL(context)}). Markdown versions of documentation pages are available by appending \`.md\` to page URLs; this page is available as [Markdown](${getPageMarkdownURL(context, page)}).`;
}
