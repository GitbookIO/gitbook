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
    withTrademark?: boolean;
    className?: string;
}) {
    const { innerHeader, context, header, className, withTrademark = true } = props;
    const { customization, revision } = context;

    const pages = await encodeClientTableOfContents(context, revision.pages, revision.pages);

    return (
        <>
            <SideSheet
                side="left"
                data-testid="table-of-contents"
                id="table-of-contents"
                toggleClass="navigation-open"
                withOverlay={true}
                withCloseButton={true}
                className={tcls(
                    'group/table-of-contents',
                    'text-sm',

                    'grow-0',
                    'shrink-0',

                    'w-4/5',
                    'md:w-1/2',
                    'lg:w-72',
                    'lg:page-no-toc:w-56',

                    'max-lg:not-sidebar-filled:bg-tint-base',
                    'max-lg:not-sidebar-filled:border-r',
                    'border-tint-subtle',

                    'lg:flex!',
                    'embed:lg:layout-full:hidden!',
                    'lg:animate-none!',
                    'lg:sticky',
                    'lg:mr-12',
                    'lg:z-0',

                    // We shrink down the sidebar to a narrow fixed element in a few limited cases:
                    !innerHeader // Only if there's no innerHeader (no variant picker or search) — otherwise we show it as normal.
                        ? [
                              // Layout-full means the page is made wide and the TOC is hidden, so the sidebar contains only a trademark.
                              // We remove the empty sidebar so content can stretch wide.
                              'layout-full:lg:fixed',
                              'layout-full:lg:max-3xl:w-12',
                              'layout-full:lg:left-5',
                              'layout-full:lg:z-30',

                              // In other cases the TOC gets hidden but the content is normal width. Since the page outline sidebar only appears on xl: and up,
                              // the TOC causes a big empty space to the left of the content. We shrink it down between lg: and xl: to prevent this imbalance.
                              'page-no-toc:lg:max-xl:fixed',
                              'page-no-toc:lg:max-xl:w-12',
                              'page-no-toc:lg:max-xl:left-5',
                              'page-no-toc:lg:max-xl:z-30',
                          ]
                        : null,

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
                    'lg:not-embed:[html[style*="--toc-top-offset"]_&]:top-(--toc-top-offset)!',
                    'lg:not-embed:[html[style*="--toc-height"]_&]:h-(--toc-height)!',
                    'lg:page-no-toc:not-embed:[html[style*="--outline-top-offset"]_&]:top-(--outline-top-offset)!',
                    'lg:page-no-toc:not-embed:[html[style*="--outline-height"]_&]:h-(--outline-height)!',

                    'embed:top-0',
                    'embed:h-full',

                    'pt-6 pb-4',
                    'supports-[-webkit-touch-callout]:pb-[env(safe-area-inset-bottom)]', // Override bottom padding on iOS since we have a transparent bottom bar
                    'lg:max-3xl:sidebar-filled:page-has-toc:pr-6',
                    'max-lg:pl-8',

                    'flex-col',
                    'gap-4',
                    className
                )}
            >
                {header}
                <div // The actual sidebar, either shown with a filled bg or transparent.
                    className={tcls(
                        '-ms-5', // By default we shift the sidebar to the left to compensate for the PagesList padding.
                        !innerHeader
                            ? 'xl:not-layout-full:page-no-toc:-ms-5 page-no-toc:ms-0' // In some specific cases (see above) we undo this shift.
                            : null,
                        'relative flex min-h-0 grow flex-col border-tint-subtle',

                        'sidebar-filled:bg-tint-subtle',
                        'theme-muted:bg-tint-subtle',
                        '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-subtle',
                        '[html.sidebar-filled.theme-muted_&]:bg-tint-base',
                        '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-base',
                        '[html.sidebar-filled.theme-gradient_&]:border',
                        'max-lg:sidebar-filled:border',
                        'lg:page-no-toc:bg-transparent!',
                        'lg:page-no-toc:border-none!',

                        'sidebar-filled:rounded-2xl',
                        'straight-corners:rounded-none',
                        '[html.sidebar-filled.circular-corners_&]:not-layout-default:rounded-4xl'
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
                    {withTrademark && customization.trademark.enabled ? (
                        <>
                            {/* Normal trademark shown when there's a TOC */}
                            <Trademark
                                context={context}
                                placement={SiteInsightsTrademarkPlacement.Sidebar}
                                className={tcls(
                                    'm-2 mt-auto page-has-toc:sidebar-default:mr-4 px-4 py-3.5',
                                    !innerHeader
                                        ? 'max-3xl:layout-full:hidden lg:max-xl:page-no-toc:hidden'
                                        : null
                                )}
                                truncate={false}
                            />

                            {/* IconOnly trademark shown when there's no TOC */}
                            <Trademark
                                context={context}
                                placement={SiteInsightsTrademarkPlacement.Sidebar}
                                className={tcls(
                                    'mb-2 self-start bg-tint-base depth-flat:bg-tint-base',
                                    innerHeader
                                        ? 'hidden'
                                        : '3xl:hidden page-has-toc:hidden xl:not-layout-full:hidden'
                                )}
                                iconOnly={true}
                            />
                        </>
                    ) : null}
                </div>
            </SideSheet>
            <TableOfContentsScript />
        </>
    );
}
