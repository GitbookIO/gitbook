import type { JSONDocument, RevisionPageDocument } from '@gitbook/api';
import type { GitBookSiteContext } from '@v2/lib/context';
import React from 'react';

import { getSpaceLanguage } from '@/intl/server';
import { t } from '@/intl/translate';
import { hasFullWidthBlock, isNodeEmpty } from '@/lib/document';
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

    const asFullWidth = document ? hasFullWidthBlock(document) : false;
    const language = getSpaceLanguage(customization);
    const updatedAt = page.updatedAt ?? page.createdAt;

    return (
        <>
            <main
                className={tcls(
                    'relative min-w-0 flex-1',
                    'py-8 lg:px-12',
                    // Allow words to break if they are too long.
                    'break-anywhere',
                    // When in api page mode without the aside, we align with the border of the main content
                    'page-api-block:xl:max-2xl:pr-0',
                    // Max size to ensure one column in api is aligned with rest of content (2 x 3xl) + (gap-3 + 2) * px-12
                    'page-api-block:mx-auto page-api-block:max-w-screen-2xl',
                    // page.layout.tableOfContents ? null : 'xl:ml-56',
                    asFullWidth ? 'page-full-width' : 'page-default-width',
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
                            }}
                        />
                    </React.Suspense>
                ) : (
                    <PageBodyBlankslate page={page} context={context} />
                )}

                {page.layout.pagination && customization.pagination.enabled ? (
                    <PageFooterNavigation context={context} page={page} />
                ) : null}

                <div className="mx-auto mt-6 page-api-block:ml-0 flex max-w-3xl flex-row flex-wrap items-center gap-4 text-tint contrast-more:text-tint-strong">
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
