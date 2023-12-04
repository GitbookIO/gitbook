import { Revision, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';
import React from 'react';

import { ContentPointer } from '@/lib/api';
import { IntlContext } from '@/lib/intl';
import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { PagesList } from './PagesList';
import { Trademark } from './Trademark';
import { SIDE_COLUMN_WITHOUT_HEADER, SIDE_COLUMN_WITH_HEADER } from '../layout';

export function TableOfContents(
    props: IntlContext & {
        content: ContentPointer;
        context: ContentRefContext;
        pages: Revision['pages'];
        activePage: RevisionPageDocument;
        ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
        header?: React.ReactNode;
        withHeaderOffset: boolean;
        visibleOnDesktop: boolean;
    },
) {
    const {
        space,
        pages,
        activePage,
        ancestors,
        header,
        context,
        withHeaderOffset,
        visibleOnDesktop,
    } = props;

    return (
        <aside
            className={tcls(
                'relative',
                'flex',
                'flex-col',
                'basis-full',
                'bg-light',
                'border-dark/2',
                'grow-0',
                'shrink-0',
                'z-[1]',
                'lg:basis-72',
                'navigation-visible:border-b',
                'lg:sticky',
                'dark:bg-dark',
                'dark:border-light/1',
                visibleOnDesktop ? null : 'lg:hidden',
                withHeaderOffset ? SIDE_COLUMN_WITH_HEADER : SIDE_COLUMN_WITHOUT_HEADER,
            )}
        >
            {header ? <div className={tcls('py-3')}>{header}</div> : null}
            <div
                className={tcls(
                    'hidden',
                    'lg:flex',
                    'flex-1',
                    'flex-grow',
                    'overflow-y-auto',
                    'gutter-stable',
                    'pr-2',
                    'navigation-visible:flex', // can be auto height animated as such https://stackoverflow.com/a/76944290
                    header ? 'pt-3' : 'pt-6',
                    'pb-6',
                )}
            >
                <PagesList
                    rootPages={pages}
                    pages={pages}
                    activePage={activePage}
                    ancestors={ancestors}
                    context={context}
                />
            </div>
            {/* TODO: integrate trademark into mobile menu */}
            {/* <Trademark space={space} /> */}
        </aside>
    );
}
