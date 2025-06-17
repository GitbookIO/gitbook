import type { JSONDocument, RevisionPageDocument } from '@gitbook/api';
import type { GitBookSiteContext } from '@v2/lib/context';
import React from 'react';

import { getSpaceLanguage } from '@/intl/server';
import { t } from '@/intl/translate';
import { hasFullWidthBlock, hasMoreThan, isNodeEmpty } from '@/lib/document';
import type { AncestorRevisionPage } from '@/lib/pages';
import { tcls } from '@/lib/tailwind';
import { DocumentView, DocumentViewSkeleton } from '../DocumentView';
import { TrackPageViewEvent } from '../Insights';
import { PageFeedbackForm } from '../PageFeedback';
import { DateRelative } from '../primitives';
import { PageBodyBlankslate } from './PageBodyBlankslate';
import { PageCover } from './PageCover';
import { PageFooterNavigation } from './PageFooterNavigation';
import { PageHeader } from './PageHeader';
import { PreservePageLayout } from './PreservePageLayout';

export function PageBody(props: {
    context: GitBookSiteContext;
    page: RevisionPageDocument;
    ancestors: AncestorRevisionPage[];
    document: JSONDocument | null;
    withPageFeedback: boolean;
}) {
    const { page, context, ancestors, document, withPageFeedback } = props;
    const { customization } = context;

    const contentFullWidth = document ? hasFullWidthBlock(document) : false;
    const shouldRenderLinkPreviews = document
        ? !hasMoreThan(
              document,
              (inline) => inline.object === 'inline' && inline.type === 'link',
              100
          )
        : false;
    const pageFullWidth = page.id === 'wtthNFMqmEQmnt5LKR0q';
    const asFullWidth = pageFullWidth || contentFullWidth;
    const language = getSpaceLanguage(customization);
    const updatedAt = page.updatedAt ?? page.createdAt;

    return (
        <>
            <main
                className={tcls(
                    'relative min-w-0 flex-1',
                    'mx-auto max-w-screen-2xl py-8',
                    // Allow words to break if they are too long.
                    'break-anywhere',
                    pageFullWidth ? 'page-full-width 2xl:px-8' : 'page-default-width',
                    asFullWidth ? 'site-full-width' : 'site-default-width',
                    page.layout.tableOfContents ? 'page-has-toc' : 'page-no-toc'
                )}
            >
                <PreservePageLayout asFullWidth={asFullWidth} />
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
                        <DocumentView
                            document={document}
                            style="grid [&>*+*]:mt-5"
                            blockStyle="page-api-block:ml-0"
                            context={{
                                mode: 'default',
                                contentContext: context,
                                shouldRenderLinkPreviews,
                            }}
                        />
                    </React.Suspense>
                ) : (
                    <PageBodyBlankslate page={page} context={context} />
                )}

                {page.layout.pagination && customization.pagination.enabled ? (
                    <PageFooterNavigation context={context} page={page} />
                ) : null}

                <div className="mx-auto mt-6 page-api-block:ml-0 flex max-w-3xl page-full-width:max-w-screen-2xl flex-row flex-wrap items-center gap-4 text-tint contrast-more:text-tint-strong">
                    {updatedAt ? (
                        <p className="mr-auto text-sm">
                            {t(language, 'page_last_modified', <DateRelative value={updatedAt} />)}
                        </p>
                    ) : null}
                    {withPageFeedback ? (
                        <PageFeedbackForm
                            className={page.layout.outline ? 'xl:hidden' : ''}
                            pageId={page.id}
                        />
                    ) : null}
                </div>
            </main>

            <TrackPageViewEvent pageId={page.id} />
        </>
    );
}
