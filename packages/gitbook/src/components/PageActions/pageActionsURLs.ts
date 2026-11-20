import urlJoin from 'url-join';

import { CustomizationPageActionType, type RevisionPageDocument } from '@gitbook/api';

import { getPDFURLSearchParams } from '../PDF';
import { getPageGitMetadata, isPageActionEnabled } from './pageActionsData';
import type { PageActionsDropdownURLs } from './PageActionsDropdown';
import type { GitBookSiteContext } from '@/lib/context';
import { getPageDocument } from '@/lib/data';
import { hasTopLevelBlock } from '@/lib/document';
import { hasAdaptiveMcpEndpoint } from '@/lib/mcp/endpoints';
import { getPageRSSURL } from '@/routes/rss';

/**
 * Return the URLs for the page actions. The page's Git path and RSS feed are loaded here, so the
 * page actions depend on the context and the page alone.
 */
export async function getPageActionsURLs(
    context: GitBookSiteContext,
    page: RevisionPageDocument
): Promise<PageActionsDropdownURLs> {
    const [document, git] = await Promise.all([
        getPageDocument(context, page),
        getPageGitMetadata(context, page),
    ]);
    // Update blocks can only be at the top level of the document, so we optimize the check.
    const withRSSFeed = document
        ? hasTopLevelBlock(document, (block) => block.type === 'updates')
        : false;
    const pagePath = context.linker.toPathForPage({ pages: context.revision.pages, page });
    const { gitSync } = context.space;

    return {
        html: context.linker.toAbsoluteURL(pagePath),
        // For the markdown URL, we use the page.path to ensure it works for the default page.
        markdown: `${context.linker.toAbsoluteURL(context.linker.toPathInSpace(page.path))}.md`,
        rss: withRSSFeed ? getPageRSSURL(context, page) : undefined,
        editOnGit:
            gitSync?.url && git
                ? {
                      provider: gitSync.installationProvider,
                      url: urlJoin(gitSync.url, git.path),
                  }
                : undefined,
        pdf: isPageActionEnabled(context.customization, CustomizationPageActionType.Pdf)
            ? context.linker.toPathInSpace(
                  `~gitbook/pdf?${getPDFURLSearchParams({
                      page: page.id,
                      only: true,
                      limit: 100,
                  }).toString()}`
              )
            : undefined,
        mcp: getPageActionsMCPURL(context),
    };
}

/**
 * Return the MCP URL to be used in the page actions dropdown.
 */
function getPageActionsMCPURL(context: GitBookSiteContext) {
    const useAuthenticatedEndpoint = hasAdaptiveMcpEndpoint(context) && context.isLoggedInVisitor;
    const endpoint = useAuthenticatedEndpoint ? '~gitbook/mcp/auth' : '~gitbook/mcp';

    return context.linker.toAbsoluteURL(context.linker.toPathInSite(endpoint));
}
