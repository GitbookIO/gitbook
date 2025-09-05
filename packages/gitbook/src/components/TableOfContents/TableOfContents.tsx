import type { GitBookSiteContext } from '@/lib/context';
import { SiteInsightsTrademarkPlacement } from '@gitbook/api';
import type React from 'react';

import { tcls } from '@/lib/tailwind';
import { PagesList } from './PagesList';
import { TOCScrollContainer } from './TOCScroller';
import { TableOfContentsScript } from './TableOfContentsScript';
import { Trademark } from './Trademark';
import { encodeClientTableOfContents } from './encodeClientTableOfContents';

export async function TableOfContents(props: {
    context: GitBookSiteContext;
    header?: React.ReactNode; // Displayed outside the scrollable TOC as a sticky header
    innerHeader?: React.ReactNode; // Displayed outside the scrollable TOC, directly above the page list
}) {
    const { innerHeader, context, header } = props;
    const { customization, revision } = context;

    const pages = await encodeClientTableOfContents(context, revision.pages, revision.pages);

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
                    'lg:page-no-toc:basis-56',

                    'relative',
                    'z-1',
                    'lg:sticky',
                    'lg:mr-12',

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

                    'pt-6',
                    'pb-4',
                    'lg:sidebar-filled:pr-6',
                    'lg:page-no-toc:pr-0',

                    'hidden',
                    'navigation-open:flex!',
                    'lg:flex',
                    'lg:page-no-toc:hidden',
                    'xl:page-no-toc:flex',
                    'lg:site-header-none:page-no-toc:flex',
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
                        'page-no-toc:border-none!',

                        'sidebar-filled:rounded-xl',
                        'straight-corners:rounded-none',
                        'page-has-toc:[html.sidebar-filled.circular-corners_&]:rounded-3xl'
                    )}
                >
                    {innerHeader ? (
                        <div className="my-4 flex flex-col space-y-4 px-5 empty:hidden">
                            {innerHeader}
                        </div>
                    ) : null}
                    <TOCScrollContainer // The scrollview inside the sidebar
                        className={tcls(
                            'flex grow flex-col p-2',
                            customization.trademark.enabled && 'lg:pb-20',
                            'hide-scrollbar overflow-y-auto'
                        )}
                    >
                        <PagesList
                            pages={pages}
                            style="page-no-toc:hidden border-tint-subtle sidebar-list-line:border-l"
                        />
                        {customization.trademark.enabled ? (
                            <Trademark
                                context={context}
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
