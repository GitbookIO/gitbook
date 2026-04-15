import type { GitBookSiteContext } from '@/lib/context';
import type { JSONDocument, RevisionPageDocument, SiteInsightsDisplayContext } from '@gitbook/api';

import { getSpaceLanguage } from '@/intl/server';
import { t } from '@/intl/translate';
import { hasFullWidthBlock, hasMoreThan, hasTopLevelBlock, isNodeEmpty } from '@/lib/document';
import type { AncestorRevisionPage } from '@/lib/pages';
import { tcls } from '@/lib/tailwind';
import { DocumentView, DocumentViewSkeleton } from '../DocumentView';
import { TrackPageViewEvent } from '../Insights';
import { PageFeedbackForm } from '../PageFeedback';
import { CurrentPageProvider } from '../hooks/useCurrentPage';
import { CONTENT_STYLE } from '../layout';
import { DateRelative, SuspenseLoadedHint } from '../primitives';
import OptionalSuspense from './OptionalSuspense';
import { PageBodyBlankslate } from './PageBodyBlankslate';
import { PageCover } from './PageCover';
import { PageFooterNavigation } from './PageFooterNavigation';
import { PageHeader } from './PageHeader';
import { PreservePageLayout } from './PreservePageLayout';

const LINK_PREVIEW_MAX_COUNT = 500;

export function PageBody(props: {
    context: GitBookSiteContext;
    page: RevisionPageDocument;
    ancestors: AncestorRevisionPage[];
    document: JSONDocument | null;
    withPageFeedback: boolean;
    insightsDisplayContext: SiteInsightsDisplayContext;
    staticRoute: boolean;
}) {
    const {
        page,
        context,
        ancestors,
        document,
        withPageFeedback,
        insightsDisplayContext,
        staticRoute,
    } = props;
    const { customization } = context;

    // Update blocks can only be at the top level of the document, so we optimize the check.
    const contentHasUpdates = document
        ? hasTopLevelBlock(document, (block) => block.type === 'updates')
        : false;

    // Render link previews only if there are less than LINK_PREVIEW_MAX_COUNT links in the document.
    const withLinkPreviews = document
        ? !hasMoreThan(
              document,
              (inline) => inline.object === 'inline' && inline.type === 'link',
              LINK_PREVIEW_MAX_COUNT
          )
        : false;

    // Determine if content should use wide layout (2-column or 1-column instead of 3-column)
    // This happens when: (1) document has full-width blocks, OR (2) page layout is explicitly set to 'wide'
    const wideContent = document ? hasFullWidthBlock(document) : false;
    const wideLayout = wideContent || page.layout.width === 'wide';
    const language = getSpaceLanguage(context);
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

    return (
        <CurrentPageProvider page={{ spaceId: context.space.id, pageId: page.id }}>
            <main
                className={tcls(
                    'relative min-w-0 flex-1',
                    'break-anywhere', // Allow words to break if they are too long.
                    'py-8',
                    'layout-wide:no-sidebar:lg:max-xl:pb-20', // Add padding to prevent overlap of minimised trademark
                    '@container',
                    CONTENT_STYLE,
                    pageHasToc ? 'page-has-toc' : 'page-no-toc',
                    wideLayout ? 'layout-wide' : 'layout-default'
                )}
            >
                <PreservePageLayout wideLayout={wideLayout} pageHasToc={pageHasToc} />
                {page.cover && page.layout.cover && page.layout.coverSize === 'hero' ? (
                    <PageCover as="hero" page={page} cover={page.cover} context={context} />
                ) : null}

                <PageHeader
                    context={context}
                    page={page}
                    ancestors={ancestors}
                    withRSSFeed={contentHasUpdates}
                />
                {document && !isNodeEmpty(document) ? (
                    <OptionalSuspense
                        staticRoute={staticRoute}
                        fallback={<DocumentViewSkeleton document={document} blockStyle="" />}
                    >
                        <SuspenseLoadedHint />
                        <DocumentView
                            document={document}
                            style="clear-both flex flex-col [&>*+*]:mt-5"
                            context={{
                                mode: 'default',
                                contentContext: {
                                    ...context,
                                    page,
                                },
                                withLinkPreviews,
                            }}
                        />
                    </OptionalSuspense>
                ) : (
                    <PageBodyBlankslate page={page} context={context} />
                )}

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
                            <p className="mr-auto text-sm ">
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
            </main>

            <TrackPageViewEvent displayContext={insightsDisplayContext} />
        </CurrentPageProvider>
    );
}
