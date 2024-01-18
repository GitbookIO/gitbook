import { CustomizationSettings, JSONDocument, RevisionPageDocument, Space } from '@gitbook/api';
import React from 'react';

import { getSpaceLanguage } from '@/intl/server';
import { t } from '@/intl/translate';
import { api } from '@/lib/api';
import { hasFullWidthBlock, isNodeEmpty } from '@/lib/document';
import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { PageBodyBlankslate } from './PageBodyBlankslate';
import { PageCover } from './PageCover';
import { PageFooterNavigation } from './PageFooterNavigation';
import { PageHeader } from './PageHeader';
import { TogglePageFullWidth } from './TogglePageFullWidth';
import { TrackPageView } from './TrackPageView';
import { DocumentView } from '../DocumentView';
import { PageFeedbackForm } from '../PageFeedback';
import { DateRelative } from '../primitives';

export function PageBody(props: {
    space: Space;
    customization: CustomizationSettings;
    page: RevisionPageDocument;
    document: JSONDocument | null;
    context: ContentRefContext;
    withDesktopTableOfContents: boolean;
    withAside: boolean;
    withPageFeedback: boolean;
}) {
    const {
        space,
        customization,
        context,
        page,
        document,
        withDesktopTableOfContents,
        withAside,
        withPageFeedback,
    } = props;

    const asFullWidth = document ? hasFullWidthBlock(document) : false;
    const language = getSpaceLanguage(customization);

    return (
        <>
            {asFullWidth ? <TogglePageFullWidth /> : null}
            <main
                className={tcls(
                    'relative',
                    'py-8',
                    'lg:px-12',
                    'flex-1',
                    withAside ? null : 'mr-56',
                    withDesktopTableOfContents ? null : 'xl:ml-72',
                )}
            >
                {page.cover && page.layout.cover && page.layout.coverSize === 'hero' ? (
                    <PageCover as="hero" page={page} cover={page.cover} context={context} />
                ) : null}

                <PageHeader page={page} />
                {document && !isNodeEmpty(document) ? (
                    <DocumentView
                        document={document}
                        style={['[&>*+*]:mt-5', 'grid']}
                        context={{
                            content: context.content,
                            resolveContentRef: (ref) => resolveContentRef(ref, context),
                        }}
                    />
                ) : (
                    <PageBodyBlankslate page={page} rootPages={context.pages} />
                )}

                {page.layout.pagination ? (
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
                    )}
                >
                    <p className={tcls('flex-1', 'text-sm', 'text-dark/6', 'dark:text-light/5')}>
                        {t(
                            language,
                            'page_last_modified',
                            <DateRelative
                                value={page.updatedAt ?? page.createdAt ?? new Date().toISOString()}
                            />,
                        )}
                    </p>
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
