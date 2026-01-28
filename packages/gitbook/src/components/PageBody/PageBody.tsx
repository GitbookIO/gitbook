import type { GitBookSiteContext } from '@/lib/context';
import type { JSONDocument, RevisionPageDocument, SiteInsightsDisplayContext } from '@gitbook/api';

import { getSpaceLanguage } from '@/intl/server';
import { t } from '@/intl/translate';
import {
    hasFullWidthBlock,
    hasMoreThan,
    hasOpenAPIBlock,
    hasTopLevelBlock,
    isNodeEmpty,
} from '@/lib/document';
import type { AncestorRevisionPage } from '@/lib/pages';
import { tcls } from '@/lib/tailwind';
import { DocumentView, DocumentViewSkeleton } from '../DocumentView';
import { TrackPageViewEvent } from '../Insights';
import { PageFeedbackForm } from '../PageFeedback';
import { CurrentPageProvider } from '../hooks/useCurrentPage';
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

    const contentFullWidth = document ? hasFullWidthBlock(document) : false;
    const contentHasOpenAPI = document ? hasOpenAPIBlock(document) : false;

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

    const language = getSpaceLanguage(context);
    const updatedAt = page.updatedAt ?? page.createdAt;

    const hasVisibleTOCItems =
        context.revision.pages.filter(
            (page) => page.type !== 'document' || (page.type === 'document' && !page.hidden)
        ).length > 0;

    const hasTOC = page.layout.tableOfContents && hasVisibleTOCItems;

    // Determine layout mode:
    // 1. Full-width: No TOC
    // 2. OpenAPI: Has TOC + (OpenAPI block OR wide property)
    // 3. Default: Has TOC, no OpenAPI blocks, not wide
    const layoutMode = !hasTOC
        ? 'layout-full-width'
        : contentHasOpenAPI || page.layout.width === 'wide'
          ? 'layout-openapi'
          : 'layout-default';

    // Site-wide width only applies to full-width mode
    const siteWidthWide = !hasTOC && (page.layout.width === 'wide' || contentFullWidth);

    return (
        <CurrentPageProvider page={{ spaceId: context.space.id, pageId: page.id }}>
            <main
                className={tcls(
                    'relative min-w-0 flex-1',
                    'max-w-screen-2xl py-8',
                    // In full-width layout, expand main to allow cover to go full width
                    'layout-full-width:max-w-full',
                    'layout-full-width:px-0',
                    // Allow words to break if they are too long.
                    'break-anywhere',
                    '@container',
                    // Layout mode class for CSS variants
                    layoutMode,
                    // Keep existing classes for backward compatibility
                    hasTOC ? 'page-has-toc' : 'page-no-toc',
                    siteWidthWide ? 'site-width-wide' : 'site-width-default',
                    // Only apply page-width-wide in full-width mode
                    !hasTOC && page.layout.width === 'wide'
                        ? 'page-width-wide 3xl:px-8'
                        : 'page-width-default'
                )}
            >
                <PreservePageLayout
                    siteWidthWide={siteWidthWide}
                    layoutMode={layoutMode}
                    hasTOC={hasTOC}
                />
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
                        fallback={
                            <DocumentViewSkeleton
                                document={document}
                                blockStyle="page-api-block:ml-0"
                            />
                        }
                    >
                        <SuspenseLoadedHint />
                        <DocumentView
                            document={document}
                            style="flex flex-col [&>*+*]:mt-5"
                            blockStyle="page-api-block:ml-0"
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

                {
                    // TODO: after 25/07/2025, we can chage it to a true check as the cache will be updated
                    page.layout.metadata !== false ? (
                        <div
                            className={tcls(
                                'mx-auto',
                                'mt-6',
                                'flex',
                                'max-w-3xl',
                                'flex-row',
                                'flex-wrap',
                                'items-center',
                                'gap-4',
                                'text-tint',
                                'contrast-more:text-tint-strong',
                                'layout-openapi:max-w-full',
                                'layout-openapi:pl-12',
                                'layout-full-width:max-w-5xl',
                                'layout-full-width:mx-auto'
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
                                    className={page.layout.outline ? 'xl:hidden' : ''}
                                    pageId={page.id}
                                />
                            ) : null}
                        </div>
                    ) : null
                }
            </main>

            <TrackPageViewEvent displayContext={insightsDisplayContext} />
        </CurrentPageProvider>
    );
}
