import type { GitBookSiteContext } from '@/lib/context';
import { SiteInsightsTrademarkPlacement } from '@gitbook/api';
import type React from 'react';

import { tcls } from '@/lib/tailwind';
import { ScrollContainer } from '../primitives/ScrollContainer';
import { SideSheet } from '../primitives/SideSheet';
import { PagesList } from './PagesList';
import { TableOfContentsScript } from './TableOfContentsScript';
import { Trademark } from './Trademark';
import { encodeClientTableOfContents } from './encodeClientTableOfContents';

/**
 * Sidebar container, responsible for setting the right dimensions and position for the sidebar.
 */
export async function TableOfContents(props: {
    context: GitBookSiteContext;
    header?: React.ReactNode; // Displayed outside the scrollable TOC as a sticky header
    innerHeader?: React.ReactNode; // Displayed outside the scrollable TOC, directly above the page list
    className?: string;
}) {
    const { innerHeader, context, header, className } = props;
    const { customization, revision } = context;

    const pages = await encodeClientTableOfContents(context, revision.pages, revision.pages);

    return (
        <>
            <SideSheet
                side="left"
                data-testid="table-of-contents"
                id="table-of-contents"
                toggleClass="navigation-open"
                withScrim={true}
                withCloseButton={true}
                className={tcls(
                    'group/table-of-contents',
                    'text-sm',

                    'grow-0',
                    'shrink-0',

                    'w-72',
                    'basis-72',
                    'lg:page-no-toc:basis-56',

                    'max-lg:not-sidebar-filled:bg-tint-base',
                    'max-lg:not-sidebar-filled:border-r',
                    'border-tint-subtle',

                    'lg:flex!',
                    'lg:animate-none!',
                    'lg:sticky',
                    'lg:mr-12',
                    'lg:z-0!',

                    // Server-side static positioning
                    'lg:top-0',
                    'lg:h-screen',
                    'lg:announcement:h-[calc(100vh-4.25rem)]',

                    // With header
                    'lg:site-header:top-16',
                    'lg:site-header:h-[calc(100vh-4rem)]',
                    'lg:announcement:site-header:h-[calc(100vh-4rem-4.25rem)]',

                    'lg:site-header-sections:top-27',
                    'lg:site-header-sections:h-[calc(100vh-6.75rem)]',
                    'lg:site-header-sections:announcement:h-[calc(100vh-6.75rem-4.25rem)]',

                    // Client-side dynamic positioning (CSS vars applied by script)
                    'lg:[html[style*="--toc-top-offset"]_&]:top-(--toc-top-offset)!',
                    'lg:[html[style*="--toc-height"]_&]:h-(--toc-height)!',
                    'lg:page-no-toc:[html[style*="--outline-top-offset"]_&]:top-(--outline-top-offset)!',
                    'lg:page-no-toc:[html[style*="--outline-height"]_&]:top-(--outline-height)!',

                    'pt-6 pb-4',
                    'lg:sidebar-filled:pr-6',
                    'lg:page-no-toc:pr-0',
                    'max-lg:pl-8',

                    'flex-col',
                    'gap-4',
                    className
                )}
            >
                {header}
                <div // The actual sidebar, either shown with a filled bg or transparent.
                    className={tcls(
                        '-ms-5',
                        'relative flex min-h-0 grow flex-col border-tint-subtle',

                        'sidebar-filled:bg-tint-subtle',
                        'theme-muted:bg-tint-subtle',
                        '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-subtle',
                        '[html.sidebar-filled.theme-muted_&]:bg-tint-base',
                        '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-base',
                        '[html.sidebar-filled.theme-gradient_&]:border',
                        'max-lg:sidebar-filled:border',
                        'page-no-toc:bg-transparent!',
                        'page-no-toc:border-none!',

                        'sidebar-filled:rounded-2xl',
                        'straight-corners:rounded-none',
                        'page-has-toc:[html.sidebar-filled.circular-corners_&]:rounded-4xl'
                    )}
                >
                    {innerHeader}
                    <ScrollContainer
                        data-testid="toc-scroll-container"
                        orientation="vertical"
                        contentClassName="flex flex-col p-2 gutter-stable"
                        active="[data-active=true]"
                        leading={{
                            fade: true,
                            button: {
                                className: '-mt-4',
                            },
                        }}
                    >
                        <PagesList
                            pages={pages}
                            isRoot={true}
                            style="page-no-toc:hidden grow border-tint-subtle sidebar-list-line:border-l"
                        />
                    </ScrollContainer>
                    {customization.trademark.enabled ? (
                        <Trademark
                            context={context}
                            placement={SiteInsightsTrademarkPlacement.Sidebar}
                            className="m-2 mt-auto sidebar-default:mr-4"
                        />
                    ) : null}
                </div>
            </SideSheet>
            <TableOfContentsScript />
        </>
    );
}
