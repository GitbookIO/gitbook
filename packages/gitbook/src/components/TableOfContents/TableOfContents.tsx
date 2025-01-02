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

function getTopOffset(props: {
    sectionsHeader: boolean;
    topHeader: boolean;
    sidebarBackgroundFilled: boolean;
}) {
    if (props.topHeader && props.sectionsHeader) {
        return 'lg:top-[6.75rem] lg:h-[calc(100vh_-_6.75rem)]';
    }

    if (props.topHeader) {
        return 'lg:top-16 lg:h-[calc(100vh_-_4rem)]';
    }

    return 'lg:top-0 lg:h-screen';
}

export function TableOfContents(props: {
    space: Space;
    customization: CustomizationSettings | SiteCustomizationSettings;
    content: SiteContentPointer;
    context: ContentRefContext;
    pages: Revision['pages'];
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
    header?: React.ReactNode; // Displayed outside the scrollable TOC as a sticky header
    headerOffset: {
        sectionsHeader: boolean;
        topHeader: boolean;
        sidebarBackgroundFilled: boolean;
    };
    innerHeader?: React.ReactNode; // Displayed outside the scrollable TOC, directly above the page list
}) {
    const { innerHeader, space, customization, pages, ancestors, header, context, headerOffset } =
        props;

    const topOffset = getTopOffset(headerOffset);

    return (
        <aside
            className={tcls(
                'group',

                'grow-0',
                'shrink-0',
                'basis-full',
                'lg:basis-72',

                'relative',
                'lg:sticky',
                'top-0',
                'h-screen',
                topOffset,
                'z-[1]',

                'py-4',
                'flex',
                'flex-col',
                'gap-4',

                'sidebar-filled:pr-4',

                // 'shadow-transparent',
                // 'shadow-thinbottom',
                // 'navigation-open:shadow-dark/2',

                // 'lg:navigation-open:border-b-0',
                // 'dark:bg-dark',
                // 'dark:navigation-open:shadow-light/2',
                // 'page-no-toc:hidden',

                // 'lg:py-4',
                // 'sidebar-filled:lg:pr-4',

                // 'lg:pt-8',
                // 'sidebar-filled:lg:pt-4',
                // 'sidebar-filled:lg:pr-4',
                // 'sidebar-filled:lg:pb-4',
            )}
        >
            {header ? header : null}
            <div
                className={tcls(
                    // 'navigation-open:pt-4',

                    'lg:-ms-5',
                    'overflow-hidden',
                    'relative',

                    // 'sidebar-filled:lg:bg-light-2',
                    'sidebar-filled:tint:bg-red-500',

                    'flex',
                    'flex-col',
                    'flex-grow',

                    'sidebar-filled:rounded-xl',
                    'sidebar-filled:straight-corners:rounded-none',
                )}
            >
                {innerHeader ? <div className={tcls('p-4')}>{innerHeader}</div> : null}
                <TOCScrollContainer
                    className={tcls(
                        'hidden',
                        'lg:flex',
                        'flex-grow',
                        'flex-col',

                        'lg:gutter-stable',
                        'py-2',
                        'pr-2',
                        // 'lg:pr-1',

                        'overflow-y-auto',

                        'group-hover:[&::-webkit-scrollbar]:bg-dark/1',
                        'group-hover:[&::-webkit-scrollbar-thumb]:bg-dark/3',
                        '[&::-webkit-scrollbar]:bg-transparent',
                        '[&::-webkit-scrollbar-thumb]:bg-transparent',
                        'dark:[&::-webkit-scrollbar]:bg-transparent',
                        'dark:[&::-webkit-scrollbar-thumb]:bg-transparent',
                        'dark:group-hover:[&::-webkit-scrollbar]:bg-light/1',
                        'dark:group-hover:[&::-webkit-scrollbar-thumb]:bg-light/3',

                        // 'navigation-open:flex',
                        customization.trademark.enabled && 'lg:pb-20',
                    )}
                >
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
            </div>
        </aside>
    );
}
