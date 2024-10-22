import {
    CustomizationSettings,
    Revision,
    RevisionPageDocument,
    RevisionPageGroup,
    SiteCustomizationSettings,
    Space,
} from '@gitbook/api';
import React from 'react';

import { SiteContentPointer } from '@/lib/api';
import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { PagesList } from './PagesList';
import { TOCScrollContainer } from './TOCScroller';
import { Trademark } from './Trademark';

function getTopOffset(props: { sectionsHeader: boolean; topHeader: boolean }) {
    if (props.sectionsHeader && props.topHeader) {
        return 'lg:top-32 lg:h-[calc(100vh_-_8rem)]';
    }
    if (props.sectionsHeader || props.topHeader) {
        return 'lg:top-16 lg:h-[calc(100vh_-_4rem)]';
    }
    return 'lg:top-0 lg:h-[100vh]';
}

export function TableOfContents(props: {
    space: Space;
    customization: CustomizationSettings | SiteCustomizationSettings;
    content: SiteContentPointer;
    context: ContentRefContext;
    pages: Revision['pages'];
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
    header?: React.ReactNode; // Displayed outside the scrollable TOC as a sticky header
    headerOffset: { sectionsHeader: boolean; topHeader: boolean };
    innerHeader?: React.ReactNode; // Displayed inside the scrollable TOC, directly above the page list
}) {
    const { innerHeader, space, customization, pages, ancestors, header, context, headerOffset } =
        props;

    const withHeaderOffset = headerOffset.sectionsHeader || headerOffset.topHeader;
    const topOffset = getTopOffset(headerOffset);

    return (
        <aside
            className={tcls(
                'relative',
                'group',
                'flex',
                'flex-col',
                'basis-full',
                'bg-light',
                'grow-0',
                'shrink-0',
                'shadow-transparent',
                'shadow-thinbottom',
                'navigation-open:shadow-dark/2',
                'z-[1]',
                'top-0',
                `h-[100vh]`,
                'lg:basis-72',
                'lg:navigation-open:border-b-0',
                'lg:sticky',
                'dark:bg-dark',
                'dark:navigation-open:shadow-light/2',
                'page-no-toc:hidden',
                topOffset,
            )}
        >
            {header ? header : null}
            <TOCScrollContainer
                className={tcls(
                    withHeaderOffset ? 'pt-4' : ['pt-4', 'lg:pt-0'],
                    'hidden',
                    'lg:flex',
                    'flex-grow',
                    'flex-col',
                    'overflow-y-auto',
                    'lg:gutter-stable',
                    'lg:pr-2',
                    'group-hover:[&::-webkit-scrollbar]:bg-dark/1',
                    'group-hover:[&::-webkit-scrollbar-thumb]:bg-dark/3',
                    '[&::-webkit-scrollbar]:bg-transparent',
                    '[&::-webkit-scrollbar-thumb]:bg-transparent',
                    'dark:[&::-webkit-scrollbar]:bg-transparent',
                    'dark:[&::-webkit-scrollbar-thumb]:bg-transparent',
                    'dark:group-hover:[&::-webkit-scrollbar]:bg-light/1',
                    'dark:group-hover:[&::-webkit-scrollbar-thumb]:bg-light/3',
                    'navigation-open:flex', // can be auto height animated as such https://stackoverflow.com/a/76944290
                    'lg:-ml-5',
                    customization.trademark.enabled ? 'lg:pb-20' : 'lg:pb-4',
                )}
            >
                {innerHeader && <div className={tcls('ms-5', 'mb-4')}>{innerHeader}</div>}
                <PagesList
                    rootPages={pages}
                    pages={pages}
                    ancestors={ancestors}
                    context={context}
                />
                {customization.trademark.enabled ? (
                    <Trademark space={space} customization={customization} />
                ) : null}
            </TOCScrollContainer>
        </aside>
    );
}
