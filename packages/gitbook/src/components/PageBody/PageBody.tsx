import {
    type JSONDocument,
    type RevisionPageDocument,
    SiteInsightsDisplayContext,
} from '@gitbook/api';

import { AIChatPageBar } from '../AIChat';
import { DocumentViewSkeleton } from '../DocumentView';
import { PaginatedUpdatesBody } from '../DocumentView/PaginatedUpdates';
import { UpdatesPagination } from '../DocumentView/UpdatesPagination';
import { CurrentPageProvider } from '../hooks/useCurrentPage';
import { TrackPageViewEvent } from '../Insights';
import { CONTENT_STYLE } from '../layout';
import { PageFeedbackForm } from '../PageFeedback';
import { DateRelative, SuspenseLoadedHint } from '../primitives';
import OptionalSuspense from './OptionalSuspense';
import { PageBodyBlankslate } from './PageBodyBlankslate';
import { PageBodyDocument } from './PageBodyDocument';
import { PageCover } from './PageCover';
import { PageFooterNavigation } from './PageFooterNavigation';
import { PageHeader } from './PageHeader';
import { PreservePageLayout } from './PreservePageLayout';
import { MAIN_CONTENT_ID } from '@/components/layout';
import { isAIChatEnabled } from '@/components/utils/isAIChatEnabled';
import { getSpaceLanguage } from '@/intl/server';
import { t } from '@/intl/translate';
import type { GitBookSiteContext } from '@/lib/context';
import { hasAPIBlock, hasFullWidthBlock, hasTopLevelBlock, isNodeEmpty } from '@/lib/document';
import type { AncestorRevisionPage } from '@/lib/pages';
import { tcls } from '@/lib/tailwind';
import { getPageRSSURL } from '@/routes/rss';

export async function PageBody(props: {
    context: GitBookSiteContext;
    page: RevisionPageDocument;
    ancestors: AncestorRevisionPage[];
    document: JSONDocument | null;
    withPageFeedback: boolean;
    insightsDisplayContext: SiteInsightsDisplayContext;
    staticRoute: boolean;
    updatesBaseHref?: string | undefined;
}) {
    const {
        page,
        context,
        ancestors,
        document,
        withPageFeedback,
        insightsDisplayContext,
        staticRoute,
        updatesBaseHref,
    } = props;
    const { customization } = context;

    // Update blocks can only be at the top level of the document, so we optimize the check.
    const contentHasUpdates = document
        ? hasTopLevelBlock(document, (block) => block.type === 'updates')
        : false;

    // Comments can only be made on change request previews, so public pages skip their markers.
    const withCommentAnchors = Boolean(context.changeRequest);

    // Determine if content should use wide layout (2-column or 1-column instead of 3-column)
    // This happens when: (1) document has full-width blocks, OR (2) page layout is explicitly set to 'wide'
    const wideContent = document ? hasFullWidthBlock(document) : false;
    // Whether the page has OpenAPI/Swagger blocks — used to scope the sticky, extracted page-actions
    // to API-reference pages only (matching the `page-api-block` styling), so other pages keep the
    // header structure untouched.
    const hasAPIBlocks = document ? hasAPIBlock(document) : false;
    const wideLayout = wideContent || page.layout.width === 'wide';
    const language = await getSpaceLanguage(context);
    const updatedAt = page.updatedAt ?? page.createdAt;

    const hasVisibleTOCItems =
        context.revision.pages.filter(
            (page) =>
                page.type === 'link' ||
                page.type === 'computed' ||
                (page.type === 'group' && !page.hidden) ||
                (page.type === 'document' && !page.hidden)
        ).length > 0;

    const pageHasToc = page.layout.tableOfContents && hasVisibleTOCItems;

    // Landing pages hide the table of contents, so it doubles as the "content page" signal.
    const withAIPageBar =
        pageHasToc &&
        insightsDisplayContext === SiteInsightsDisplayContext.Site &&
        isAIChatEnabled(customization.ai?.mode);

    let content = <PageBodyBlankslate page={page} context={context} />;
    if (document && !isNodeEmpty(document)) {
        content = (
            <OptionalSuspense
                staticRoute={staticRoute}
                fallback={<DocumentViewSkeleton document={document} blockStyle="" />}
            >
                <SuspenseLoadedHint />
                <div className="contents" data-content-ref-root="">
                    <PageBodyDocument document={document} context={context} page={page} />
                </div>
            </OptionalSuspense>
        );
    }
    if (updatesBaseHref) {
        content = (
            <>
                <PaginatedUpdatesBody>{content}</PaginatedUpdatesBody>
                <UpdatesPagination language={language} baseHref={updatesBaseHref} />
            </>
        );
    }

    return (
        <CurrentPageProvider page={{ spaceId: context.space.id, pageId: page.id }}>
            {contentHasUpdates ? (
                <link
                    rel="alternate"
                    type="application/rss+xml"
                    href={getPageRSSURL(context, page)}
                    title="RSS Feed"
                />
            ) : null}
            <main
                id={MAIN_CONTENT_ID}
                tabIndex={-1}
                // Comments on the whole page target anywhere in it that isn't a block.
                {...(withCommentAnchors ? { 'data-comment-page': '' } : {})}
                className={tcls(
                    'relative min-w-0 flex-1 outline-none',
                    'break-anywhere', // Allow words to break if they are too long.
                    'py-8',
                    'layout-wide:no-sidebar:lg:max-xl:pb-20', // Add padding to prevent overlap of minimised trademark
                    '@container',
                    // Flex column so the growing content wrapper below fills the page: the footer
                    // navigation settles at the bottom, and a full-page cover shows behind the content.
                    'flex flex-col',
                    CONTENT_STYLE,
                    pageHasToc ? 'page-has-toc' : 'page-no-toc',
                    wideLayout ? 'layout-wide' : 'layout-default'
                )}
            >
                <PreservePageLayout wideLayout={wideLayout} pageHasToc={pageHasToc} />
                {page.cover && page.layout.cover && page.layout.coverSize === 'hero' ? (
                    <PageCover as="hero" page={page} cover={page.cover} context={context} />
                ) : null}

                {/* Grows to fill the page (so the footer navigation below settles at the bottom) and
                    stays a plain block — this gives the floated, sticky API page-actions a tall
                    containing block to travel within while letting the breadcrumbs wrap around them
                    (see PageHeader). */}
                <div className="min-w-0 grow">
                    <PageHeader
                        context={context}
                        page={page}
                        ancestors={ancestors}
                        withRSSFeed={contentHasUpdates}
                        hasAPIBlocks={hasAPIBlocks}
                        asEmbeddable={insightsDisplayContext === SiteInsightsDisplayContext.Embed}
                    />
                    {content}
                </div>

                {page.layout.pagination && customization.pagination.enabled ? (
                    <PageFooterNavigation context={context} page={page} />
                ) : null}

                {page.layout.metadata ? (
                    <div
                        className={tcls(
                            CONTENT_STYLE,
                            'mt-6 flex flex-row flex-wrap items-center gap-4 text-tint contrast-more:text-tint-strong'
                        )}
                    >
                        {updatedAt ? (
                            <p className="mr-auto text-sm">
                                {t(
                                    language,
                                    'page_last_modified',
                                    <DateRelative value={updatedAt} />
                                )}
                            </p>
                        ) : null}
                        {withPageFeedback ? (
                            <PageFeedbackForm
                                className={
                                    // Hide feedback form when outline is visible on desktop, but show it in some special cases
                                    page.layout.outline
                                        ? 'layout-wide:chat-open:max-[2416px]:flex layout-wide:max-3xl:flex xl:hidden xl:max-3xl:chat-open:flex'
                                        : ''
                                }
                                pageId={page.id}
                            />
                        ) : null}
                    </div>
                ) : null}

                {withAIPageBar ? <AIChatPageBar /> : null}
            </main>

            <TrackPageViewEvent displayContext={insightsDisplayContext} />
        </CurrentPageProvider>
    );
}
