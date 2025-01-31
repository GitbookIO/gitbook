import {
    CustomizationSettings,
    JSONDocument,
    RevisionPageDocument,
    SiteCustomizationSettings,
    Space,
} from '@gitbook/api';
import React from 'react';

import { getSpaceLanguage } from '@/intl/server';
import { t } from '@/intl/translate';
import { ContentTarget, SiteContentPointer, api } from '@/lib/api';
import { hasFullWidthBlock, isNodeEmpty } from '@/lib/document';
import { AncestorRevisionPage } from '@/lib/pages';
import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { PageBodyBlankslate } from './PageBodyBlankslate';
import { PageCover } from './PageCover';
import { PageFooterNavigation } from './PageFooterNavigation';
import { PageHeader } from './PageHeader';
import { PreservePageLayout } from './PreservePageLayout';
import { DocumentView, DocumentViewSkeleton } from '../DocumentView';
import { TrackPageViewEvent } from '../Insights';
import { PageFeedbackForm } from '../PageFeedback';
import { DateRelative } from '../primitives';

export function PageBody(props: {
    space: Space;
    pointer: SiteContentPointer;
    contentTarget: ContentTarget;
    customization: CustomizationSettings | SiteCustomizationSettings;
    page: RevisionPageDocument;
    ancestors: AncestorRevisionPage[];
    document: JSONDocument | null;
    context: ContentRefContext;
    withPageFeedback: boolean;
}) {
    const {
        space,
        contentTarget,
        customization,
        context,
        page,
        ancestors,
        document,
        withPageFeedback,
    } = props;

    const asFullWidth = document ? hasFullWidthBlock(document) : false;
    const language = getSpaceLanguage(customization);
    const updatedAt = page.updatedAt ?? page.createdAt;

    return (
        <>
            <main
                className={
                    tcls(
                        'flex-1',
                        'relative',
                        'py-8',
                        'lg:px-12',
                        // Allow words to break if they are too long.
                        'break-anywhere',
                        // When in api page mode without the aside, we align with the border of the main content
                        'page-api-block:xl:max-2xl:pr-0',
                        // Max size to ensure one column in api is aligned with rest of content (2 x 3xl) + (gap-3 + 2) * px-12
                        'page-api-block:max-w-[1654px]',
                        'page-api-block:mx-auto',

                        page.layout.outline ? null : 'xl:mr-56',
                        page.layout.tableOfContents ? null : 'xl:ml-56',
                    ) +
                    (asFullWidth ? ' page-full-width' : '') +
                    (!page.layout.tableOfContents ? ' page-no-toc' : '')
                }
            >
                <PreservePageLayout asFullWidth={asFullWidth} />
                {page.cover && page.layout.cover && page.layout.coverSize === 'hero' ? (
                    <PageCover as="hero" page={page} cover={page.cover} context={context} />
                ) : null}

                <PageHeader page={page} ancestors={ancestors} pages={context.pages} />
                {document && !isNodeEmpty(document) ? (
                    <React.Suspense
                        fallback={
                            <DocumentViewSkeleton
                                document={document}
                                blockStyle={['page-api-block:ml-0']}
                            />
                        }
                    >
                        <DocumentView
                            document={document}
                            style={['[&>*+*]:mt-5', 'grid']}
                            blockStyle={[
                                'page-api-block:ml-0',
                                'page-api-block:[.openapi-operation]:mb-12',
                                'last:page-api-block:[.openapi-operation]::mb-5',
                                'only:page-api-block:[.openapi-operation]:mb-5',
                            ]}
                            context={{
                                mode: 'default',
                                content: contentTarget,
                                contentRefContext: context,
                                resolveContentRef: (ref, options) =>
                                    resolveContentRef(ref, context, options),
                            }}
                        />
                    </React.Suspense>
                ) : (
                    <PageBodyBlankslate page={page} rootPages={context.pages} context={context} />
                )}

                {page.layout.pagination && customization.pagination.enabled ? (
                    <PageFooterNavigation
                        space={space}
                        customization={customization}
                        pages={context.pages}
                        page={page}
                    />
                ) : null}

                <div
                    className={tcls(
                        'flex',
                        'flex-row',
                        'flex-wrap',
                        'gap-4',
                        'items-center',
                        'mt-6',
                        'max-w-3xl',
                        'mx-auto',
                        'page-api-block:ml-0',
                        'text-dark/7',
                        'dark:text-light/7',
                        'contrast-more:text-dark',
                        'dark:contrast-more:text-light',
                    )}
                >
                    {updatedAt ? (
                        <p className={tcls('text-sm mr-auto')}>
                            {t(language, 'page_last_modified', <DateRelative value={updatedAt} />)}
                        </p>
                    ) : null}
                    {withPageFeedback ? (
                        <PageFeedbackForm
                            className={page.layout.outline ? 'xl:hidden' : ''}
                            orientation="horizontal"
                            pageId={page.id}
                        />
                    ) : null}
                </div>
            </main>

            <TrackPageViewEvent pageId={page.id} revisionId={space.revision} />
        </>
    );
}
