import { CustomizationPageActionType, type RevisionPageDocument } from '@gitbook/api';

import type { GitBookSiteContext } from '@/lib/context';

const CONFIGURABLE_PAGE_ACTIONS = [
    CustomizationPageActionType.Assistant,
    CustomizationPageActionType.ExternalAi,
    CustomizationPageActionType.Markdown,
    CustomizationPageActionType.Mcp,
    CustomizationPageActionType.Pdf,
    CustomizationPageActionType.Git,
];

/**
 * Whether a given built-in page action is enabled.
 */
export function isPageActionEnabled(
    customization: GitBookSiteContext['customization'],
    type: CustomizationPageActionType
): boolean {
    const { pageActions } = customization;
    if (pageActions.items) {
        return pageActions.items.includes(type);
    }
    return false;
}

/**
 * Whether any of the configured page actions is enabled. The RSS feed is not part of them: it is
 * only offered on pages with an updates block.
 */
export function hasConfiguredPageActions(customization: GitBookSiteContext['customization']) {
    return CONFIGURABLE_PAGE_ACTIONS.some((type) => isPageActionEnabled(customization, type));
}

/**
 * Get the Git metadata of a page for the Edit on Git action, or nothing when that action is not shown.
 */
export async function getPageGitMetadata(
    context: GitBookSiteContext,
    page: RevisionPageDocument
): Promise<RevisionPageDocument['git']> {
    if (
        !context.space.gitSync?.url ||
        !isPageActionEnabled(context.customization, CustomizationPageActionType.Git)
    ) {
        return undefined;
    }
    if (page.git) {
        return page.git;
    }

    // Revision trees omit metadata for cache efficiency, so load it only when this action needs the Git path.
    const response = await context.dataFetcher.getRevisionPageByPath({
        spaceId: context.space.id,
        revisionId: context.revisionId,
        path: page.path,
        metadata: true,
        cachedMetadata: true,
    });
    const pageWithMetadata = response.data;
    return pageWithMetadata?.type === 'document' ? pageWithMetadata.git : undefined;
}
