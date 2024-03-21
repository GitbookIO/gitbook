import { CustomizationSettings, JSONDocument, RevisionPageDocument, Space } from '@gitbook/api';
import React from 'react';

import { getSpaceLanguage } from '@/intl/server';
import { t } from '@/intl/translate';
import { ContentTarget, api } from '@/lib/api';
import { hasFullWidthBlock, isNodeEmpty } from '@/lib/document';
import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { PageBodyBlankslate } from './PageBodyBlankslate';
import { PageCover } from './PageCover';
import { PageFooterNavigation } from './PageFooterNavigation';
import { PageHeader } from './PageHeader';
import { TrackPageView } from './TrackPageView';
import { DocumentView } from '../DocumentView';
import { PageFeedbackForm } from '../PageFeedback';
import { DateRelative } from '../primitives';

export function PageBody(props: {
    space: Space;
    contentTarget: ContentTarget;
    customization: CustomizationSettings;
    page: RevisionPageDocument;
    document: JSONDocument | null;
    context: ContentRefContext;
    withPageFeedback: boolean;
}) {
    const { space, contentTarget, customization, context, page, document, withPageFeedback } =
        props;

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
                {page.cover && page.layout.cover && page.layout.coverSize === 'hero' ? (
                    <PageCover as="hero" page={page} cover={page.cover} context={context} />
                ) : null}

                <PageHeader page={page} />
                {document && !isNodeEmpty(document) ? (
                    <DocumentView
                        document={document}
                        style={['[&>*+*]:mt-5', 'grid']}
                        blockStyle={['page-api-block:ml-0']}
                        context={{
                            mode: 'default',
                            content: contentTarget,
                            resolveContentRef: (ref, options) =>
                                resolveContentRef(ref, context, options),
                        }}
                    />
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
                        'items-center',
                        'mt-6',
                        'max-w-3xl',
                        'mx-auto',
                        'page-api-block:ml-0',
                    )}
                >
                    {updatedAt ? (
                        <p
                            className={tcls(
                                'flex-1',
                                'text-sm',
                                'text-dark/6',
                                'dark:text-light/5',
                            )}
                        >
                            {t(language, 'page_last_modified', <DateRelative value={updatedAt} />)}
                        </p>
                    ) : null}
                    {withPageFeedback ? (
                        <PageFeedbackForm
                            orientation="horizontal"
                            spaceId={space.id}
                            pageId={page.id}
                        />
                    ) : null}
                </div>
            </main>
            <React.Suspense fallback={null}>
                <TrackPageView spaceId={space.id} pageId={page.id} apiHost={api().endpoint} />
            </React.Suspense>
        </>
    );
}
