import { CustomizationSettings, JSONDocument, RevisionPageDocument, Space } from '@gitbook/api';
import React from 'react';

import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { PageCover } from './PageCover';
import { PageFooterNavigation } from './PageFooterNavigation';
import { PageHeader } from './PageHeader';
import { PageLoading } from './PageLoading';
import { DocumentView } from '../DocumentView';
import { PageFeedbackForm } from '../PageFeedback';

export function PageBody(props: {
    space: Space;
    customization: CustomizationSettings;
    page: RevisionPageDocument;
    context: ContentRefContext;
    document: JSONDocument | null;
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

    return (
        <main
            className={tcls(
                'relative',
                'py-8',
                'px-4',
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
            {document ? (
                <DocumentView document={document} style={['space-y-6', 'grid']} context={context} />
            ) : null}

            {page.layout.pagination ? (
                <PageFooterNavigation
                    space={space}
                    customization={customization}
                    pages={context.pages}
                    page={page}
                />
            ) : null}

            {withPageFeedback ? (
                <div
                    className={tcls(
                        'flex',
                        'flex-row',
                        'justify-end',
                        'mt-6',
                        'max-w-3xl',
                        'mx-auto',
                    )}
                >
                    <PageFeedbackForm spaceId={space.id} pageId={page.id} />
                </div>
            ) : null}

            <React.Suspense fallback={null}>
                <PageLoading />
            </React.Suspense>
        </main>
    );
}
