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
import { getTableOfContentsClassName, getTableOfContentsSidebarClassName } from './styles';

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
                data-gb-table-of-contents
                toggleClass="navigation-open"
                withOverlay={true}
                withCloseButton={true}
                className={getTableOfContentsClassName(className)}
            >
                {header}
                <div // The actual sidebar, either shown with a filled bg or transparent.
                    className={getTableOfContentsSidebarClassName()}
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
                                    'm-2 mt-auto px-4 py-3.5 layout-wide:no-sidebar:lg:max-3xl:hidden layout-default:no-sidebar:lg:max-xl:hidden'
                                )}
                                truncate={false}
                            />

                            {/* IconOnly trademark shown when there's no TOC */}
                            <Trademark
                                context={context}
                                placement={SiteInsightsTrademarkPlacement.Sidebar}
                                className={tcls(
                                    'mb-2 3xl:hidden layout-default:hidden self-start bg-tint-base depth-flat:bg-tint-base has-sidebar:hidden layout-default:no-sidebar:lg:max-xl:flex'
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
