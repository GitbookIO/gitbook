import {
    CustomizationSettings,
    Revision,
    RevisionPageDocument,
    RevisionPageGroup,
    SiteCustomizationSettings,
    SiteInsightsTrademarkPlacement,
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
    };
    innerHeader?: React.ReactNode; // Displayed outside the scrollable TOC, directly above the page list
}) {
    const { innerHeader, space, customization, pages, ancestors, header, context, headerOffset } =
        props;

    const topOffset = getTopOffset(headerOffset);

    return (
        <aside // Sidebar container, responsible for setting the right dimensions and position for the sidebar.
            data-testid="table-of-contents"
            className={tcls(
                'group',
                'page-no-toc:hidden',

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

                'pt-6',
                'pb-4',
                'sidebar-filled:lg:pr-6',

                'hidden',
                'navigation-open:flex',
                'lg:flex',
                'flex-col',
                'gap-4',

                'navigation-open:border-b',
                'border-gray-subtle',
            )}
        >
            {header && header}
            <div // The actual sidebar, either shown with a filled bg or transparent.
                className={tcls(
                    'lg:-ms-5',
                    'overflow-hidden',
                    'relative',

                    'flex',
                    'flex-col',
                    'flex-grow',

                    'sidebar-filled:bg-light-2',
                    '[html.tint.sidebar-filled_&]:bg-light-1',
                    'dark:sidebar-filled:bg-dark-1',
                    'dark:[html.tint.sidebar-filled_&]:bg-dark-1',

                    'sidebar-filled:rounded-xl',
                    'straight-corners:rounded-none',
                )}
            >
                {innerHeader && <div className={tcls('px-5 *:my-4')}>{innerHeader}</div>}
                <TOCScrollContainer // The scrollview inside the sidebar
                    className={tcls(
                        'flex',
                        'flex-grow',
                        'flex-col',

                        'p-2',
                        customization.trademark.enabled && 'lg:pb-20',

                        'overflow-y-auto',
                        'lg:gutter-stable',
                        'group-hover:[&::-webkit-scrollbar]:bg-dark/1',
                        'group-hover:[&::-webkit-scrollbar-thumb]:bg-dark/3',
                        '[&::-webkit-scrollbar]:bg-transparent',
                        '[&::-webkit-scrollbar-thumb]:bg-transparent',
                        'dark:[&::-webkit-scrollbar]:bg-transparent',
                        'dark:[&::-webkit-scrollbar-thumb]:bg-transparent',
                        'dark:group-hover:[&::-webkit-scrollbar]:bg-light/1',
                        'dark:group-hover:[&::-webkit-scrollbar-thumb]:bg-light/3',
                    )}
                >
                    <PagesList
                        rootPages={pages}
                        pages={pages}
                        ancestors={ancestors}
                        context={context}
                        style={tcls(
                            'sidebar-list-line:border-l',
                            'border-gray-subtle',
                        )}
                    />
                    {customization.trademark.enabled ? (
                        <Trademark
                            space={space}
                            customization={customization}
                            placement={SiteInsightsTrademarkPlacement.Sidebar}
                        />
                    ) : null}
                </TOCScrollContainer>
            </div>
        </aside>
    );
}
