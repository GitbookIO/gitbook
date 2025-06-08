import { PagesList } from '@/components/TableOfContents';
import { Trademark } from '@/components/TableOfContents';
import { TOCScrollContainer } from '@/components/TableOfContents/TOCScroller';
import { tcls } from '@/lib/tailwind';
import { SiteInsightsTrademarkPlacement } from '@gitbook/api';
import type { GitBookSiteContext } from '@v2/lib/context';

export function TOCScrollContent(props: {
    context: GitBookSiteContext;
    innerHeader?: React.ReactNode;
}) {
    const { context, innerHeader } = props;
    const { customization } = context;

    return (
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
                'straight-corners:rounded-none'
            )}
        >
            {!!innerHeader && (
                <div className="inline-flex w-full flex-col gap-4 px-2 max-lg:py-2 max-lg:pr-12 lg:pr-4 lg:first:mt-4">
                    {innerHeader}
                </div>
            )}

            <TOCScrollContainer // The scrollview inside the sidebar
                className={tcls(
                    'flex flex-grow flex-col p-2',
                    innerHeader ? 'mt-0 lg:mt-2' : 'mt-8',
                    customization.trademark.enabled && 'pb-20',
                    'gutter-stable overflow-y-auto',
                    '[&::-webkit-scrollbar]:bg-transparent',
                    '[&::-webkit-scrollbar-thumb]:bg-transparent',
                    'group-hover:[&::-webkit-scrollbar]:bg-tint-subtle',
                    'group-hover:[&::-webkit-scrollbar-thumb]:bg-tint-7',
                    'group-hover:[&::-webkit-scrollbar-thumb:hover]:bg-tint-8'
                )}
            >
                <PagesList
                    rootPages={context.pages}
                    pages={context.pages}
                    context={context}
                    style="page-no-toc:hidden border-tint-subtle sidebar-list-line:border-l"
                />
                {customization.trademark.enabled ? (
                    <Trademark
                        space={context.space}
                        customization={customization}
                        placement={SiteInsightsTrademarkPlacement.Sidebar}
                    />
                ) : null}
            </TOCScrollContainer>
        </div>
    );
}
