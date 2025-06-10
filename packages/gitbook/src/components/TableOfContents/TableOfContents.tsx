import { SiteInsightsTrademarkPlacement } from '@gitbook/api';
import type { GitBookSiteContext } from '@v2/lib/context';
import type React from 'react';

import { tcls } from '@/lib/tailwind';

import { PagesList } from './PagesList';
import { TOCScrollContainer } from './TOCScroller';
import { TableOfContentsScript } from './TableOfContentsScript';
import { Trademark } from './Trademark';

export function TableOfContents(props: {
    context: GitBookSiteContext;
    header?: React.ReactNode; // Displayed outside the scrollable TOC as a sticky header
    innerHeader?: React.ReactNode; // Displayed outside the scrollable TOC, directly above the page list
}) {
    const { innerHeader, context, header } = props;
    const { space, customization, pages } = context;

    return (
        <>
            <aside // Sidebar container, responsible for setting the right dimensions and position for the sidebar.
                data-testid="table-of-contents"
                id="table-of-contents"
                className={tcls(
                    'group',
                    'text-sm',

                    'grow-0',
                    'shrink-0',
                    'basis-full',
                    'lg:basis-72',
                    'page-no-toc:lg:basis-56',

                    'relative',
                    'z-[1]',
                    'lg:sticky',
                    'lg:mr-12',

                    // Server-side static positioning
                    'lg:top-0',
                    'lg:h-screen',
                    'announcement:lg:h-[calc(100vh-4.25rem)]',

                    'site-header:lg:top-16',
                    'site-header:lg:h-[calc(100vh-4rem)]',
                    'announcement:site-header:lg:h-[calc(100vh-4rem-4.25rem)]',

                    'site-header-sections:lg:top-[6.75rem]',
                    'site-header-sections:lg:h-[calc(100vh-6.75rem)]',
                    'announcement:site-header-sections:lg:h-[calc(100vh-6.75rem-4.25rem)]',

                    // Client-side dynamic positioning (CSS vars applied by script)
                    '[html[style*="--toc-top-offset"]_&]:lg:!top-[var(--toc-top-offset)]',
                    '[html[style*="--toc-height"]_&]:lg:!h-[var(--toc-height)]',

                    'pt-6',
                    'pb-4',
                    'sidebar-filled:lg:pr-6',
                    'page-no-toc:lg:pr-0',

                    'hidden',
                    'navigation-open:!flex',
                    'lg:flex',
                    'page-no-toc:lg:hidden',
                    'page-no-toc:xl:flex',
                    'site-header-none:page-no-toc:lg:flex',
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
                        'relative flex flex-grow flex-col overflow-hidden border-tint-subtle',

                        'sidebar-filled:bg-tint-subtle',
                        'theme-muted:bg-tint-subtle',
                        '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-subtle',
                        '[html.sidebar-filled.theme-muted_&]:bg-tint-base',
                        '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-base',
                        '[html.sidebar-filled.theme-gradient_&]:border',
                        'page-no-toc:!bg-transparent',
                        'page-no-toc:!border-none',

                        'sidebar-filled:rounded-xl',
                        'straight-corners:rounded-none',
                        '[html.sidebar-filled.circular-corners_&]:page-has-toc:rounded-3xl'
                    )}
                >
                    {innerHeader && <div className="px-5 *:my-4">{innerHeader}</div>}
                    <TOCScrollContainer // The scrollview inside the sidebar
                        className={tcls(
                            'flex flex-grow flex-col p-2',
                            customization.trademark.enabled && 'lg:pb-20',
                            'lg:gutter-stable overflow-y-auto',
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
                            style="page-no-toc:hidden border-tint-subtle sidebar-list-line:border-l"
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
            <TableOfContentsScript />
        </>
    );
}
