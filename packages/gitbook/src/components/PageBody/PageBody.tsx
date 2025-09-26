import type { GitBookSiteContext } from '@/lib/context';
import type { JSONDocument, RevisionPageDocument, SiteInsightsDisplayContext } from '@gitbook/api';
import React from 'react';

import { getSpaceLanguage } from '@/intl/server';
import { t } from '@/intl/translate';
import { hasFullWidthBlock, hasMoreThan, isNodeEmpty } from '@/lib/document';
import type { AncestorRevisionPage } from '@/lib/pages';
import { tcls } from '@/lib/tailwind';
import { DocumentView, DocumentViewSkeleton } from '../DocumentView';
import { TrackPageViewEvent } from '../Insights';
import { PageFeedbackForm } from '../PageFeedback';
import { CurrentPageProvider } from '../hooks/useCurrentPage';
import { DateRelative, SuspenseLoadedHint } from '../primitives';
import { PageBodyBlankslate } from './PageBodyBlankslate';
import { PageCover } from './PageCover';
import { PageFooterNavigation } from './PageFooterNavigation';
import { PageHeader } from './PageHeader';
import { PreservePageLayout } from './PreservePageLayout';

const LINK_PREVIEW_MAX_COUNT = 100;

export function PageBody(props: {
    context: GitBookSiteContext;
    page: RevisionPageDocument;
    ancestors: AncestorRevisionPage[];
    document: JSONDocument | null;
    withPageFeedback: boolean;
    insightsDisplayContext: SiteInsightsDisplayContext;
}) {
    const { page, context, ancestors, document, withPageFeedback, insightsDisplayContext } = props;
    const { customization } = context;

    const contentFullWidth = document ? hasFullWidthBlock(document) : false;

    // Render link previews only if there are less than LINK_PREVIEW_MAX_COUNT links in the document.
    const withLinkPreviews = document
        ? !hasMoreThan(
              document,
              (inline) => inline.object === 'inline' && inline.type === 'link',
              LINK_PREVIEW_MAX_COUNT
          )
        : false;
    const pageWidthWide = page.layout.width === 'wide';
    const siteWidthWide = pageWidthWide || contentFullWidth;
    const language = getSpaceLanguage(context);
    const updatedAt = page.updatedAt ?? page.createdAt;

    return (
        <CurrentPageProvider page={{ spaceId: context.space.id, pageId: page.id }}>
            <main
                className={tcls(
                    'relative min-w-0 flex-1',
                    'max-w-screen-2xl py-8',
                    // Allow words to break if they are too long.
                    'break-anywhere',
                    pageWidthWide ? 'page-width-wide 3xl:px-8' : 'page-width-default',
                    siteWidthWide ? 'site-width-wide' : 'site-width-default',
                    page.layout.tableOfContents ? 'page-has-toc' : 'page-no-toc'
                )}
            >
                <PreservePageLayout siteWidthWide={siteWidthWide} />
                {page.cover && page.layout.cover && page.layout.coverSize === 'hero' ? (
                    <PageCover as="hero" page={page} cover={page.cover} context={context} />
                ) : null}

                <PageHeader context={context} page={page} ancestors={ancestors} />
                {document && !isNodeEmpty(document) ? (
                    <React.Suspense
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
                            style="grid [&>*+*]:mt-5"
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
                    </React.Suspense>
                ) : (
                    <PageBodyBlankslate page={page} context={context} />
                )}

                {page.layout.pagination && customization.pagination.enabled ? (
                    <PageFooterNavigation context={context} page={page} />
                ) : null}

                {
                    // TODO: after 25/07/2025, we can chage it to a true check as the cache will be updated
                    page.layout.metadata !== false ? (
                        <div className="mx-auto mt-6 page-api-block:ml-0 flex max-w-3xl page-full-width:max-w-screen-2xl flex-row flex-wrap items-center gap-4 text-tint contrast-more:text-tint-strong">
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
