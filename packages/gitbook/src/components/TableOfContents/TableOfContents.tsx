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
                'basis-full',
                'lg:basis-72',
                'lg:page-no-toc:basis-56',

                'relative',
                'z-1',
                'lg:sticky',
                // Without header
                'lg:top-0',
                'lg:h-screen',

                // With header
                'lg:site-header:top-16',
                'lg:site-header:h-[calc(100vh-4rem)]',

                // With header and sections
                'lg:site-header-sections:top-[6.75rem]',
                'lg:site-header-sections:h-[calc(100vh-6.75rem)]',

                'pt-6',
                'pb-4',
                'lg:sidebar-filled:pr-6',
                'lg:page-no-toc:pr-0',

                'hidden',
                'navigation-open:flex!',
                'lg:flex',
                'lg:page-no-toc:hidden',
                'xl:page-no-toc:flex',
                'lg:page-no-toc:site-header-none:flex',
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
                    'relative flex grow flex-col overflow-hidden border-tint-subtle',

                    'sidebar-filled:bg-tint-subtle',
                    'theme-muted:bg-tint-subtle',
                    '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-subtle',
                    '[html.sidebar-filled.theme-muted_&]:bg-tint-base',
                    '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-base',
                    '[html.sidebar-filled.theme-gradient_&]:border',
                    'page-no-toc:bg-transparent!',

                    'sidebar-filled:rounded-xl',
                    'straight-corners:rounded-none'
                )}
            >
                {innerHeader && <div className="px-5 *:my-4">{innerHeader}</div>}
                <TOCScrollContainer // The scrollview inside the sidebar
                    className={tcls(
                        'flex grow flex-col p-2',
                        customization.trademark.enabled && 'lg:pb-20',
                        'lg:gutter-stable overflow-y-auto'
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
    );
}
