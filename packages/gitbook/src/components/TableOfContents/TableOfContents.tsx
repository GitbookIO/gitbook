import { SiteInsightsTrademarkPlacement } from '@gitbook/api';
import type { GitBookSiteContext } from '@v2/lib/context';
import type React from 'react';

import { tcls } from '@/lib/tailwind';

import { PagesList } from './PagesList';
import { TOCScrollContainer } from './TOCScroller';
import { Trademark } from './Trademark';

export function TableOfContents(props: {
    context: GitBookSiteContext;
    header?: React.ReactNode; // Displayed outside the scrollable TOC as a sticky header
    innerHeader?: React.ReactNode; // Displayed outside the scrollable TOC, directly above the page list
}) {
    const { innerHeader, context, header } = props;
    const { space, customization, pages } = context;

    return (
        <aside // Sidebar container, responsible for setting the right dimensions and position for the sidebar.
            data-testid="table-of-contents"
            className={tcls(
                'group',
                'text-sm',

                'grow-0',
                'shrink-0',
                'w-full',
                'page-no-toc:lg:w-40',
                'page-no-toc:xl:w-56',
                customization.header.preset === 'none' && 'page-no-toc:lg:w-56',
                'lg:w-72',

                'relative',
                'z-10',
                'lg:sticky',
                // Without header
                'lg:top-0',
                'lg:h-screen',

                // With header
                'site-header:lg:top-16',
                'site-header:lg:h-[calc(100vh_-_4rem)]',

                // With header and sections
                'site-header-sections:lg:top-[6.75rem]',
                'site-header-sections:lg:h-[calc(100vh_-_6.75rem)]',

                'pt-6',
                'pb-4',
                'sidebar-filled:lg:pr-6',
                'sidebar-filled:page-no-toc:lg:pr-0',

                'hidden',
                'navigation-open:!flex',
                'lg:flex',
                'flex-col',
                'gap-4',

                'navigation-open:border-b',
                'border-tint-subtle'
            )}
        >
            {header && header}
            <div // The actual sidebar, either shown with a filled bg or transparent.
                className={tcls(
                    'lg:-ms-5',
                    'overflow-hidden',
                    'page-no-toc:overflow-visible',
                    'relative',

                    'flex',
                    'flex-col',
                    'flex-grow',

                    'sidebar-filled:bg-tint-subtle',
                    'theme-muted:bg-tint-subtle',
                    'theme-bold-tint:bg-tint-subtle',
                    '[html.sidebar-filled.theme-muted_&]:bg-tint-base',
                    '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-base',
                    'page-no-toc:!bg-transparent',

                    'sidebar-filled:rounded-xl',
                    'straight-corners:rounded-none'
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
                        '[&::-webkit-scrollbar]:bg-transparent',
                        '[&::-webkit-scrollbar-thumb]:bg-transparent',
                        'group-hover:[&::-webkit-scrollbar]:bg-tint-subtle',
                        'group-hover:[&::-webkit-scrollbar-thumb]:bg-tint-7',
                        'group-hover:[&::-webkit-scrollbar-thumb:hover]:bg-tint-8'
                    )}
                >
                    <PagesList
                        rootPages={pages}
                        pages={pages}
                        context={context}
                        style={tcls(
                            'page-no-toc:hidden',
                            'sidebar-list-line:border-l',
                            'border-tint-subtle',
                            'mb-6',
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
