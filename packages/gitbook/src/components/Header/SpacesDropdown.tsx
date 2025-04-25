import type { SiteSpace } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import type { GitBookSiteContext } from '@v2/lib/context';
import { Dropdown, DropdownChevron, DropdownMenu } from './DropdownMenu';
import { SpacesDropdownMenuItem } from './SpacesDropdownMenuItem';

export function SpacesDropdown(props: {
    context: GitBookSiteContext;
    siteSpace: SiteSpace;
    siteSpaces: SiteSpace[];
    className?: string;
}) {
    const { context, siteSpace, siteSpaces, className } = props;
    const { linker } = context;

    return (
        <DropdownMenu
            className={tcls(
                'group-hover/dropdown:invisible', // Prevent hover from opening the dropdown, as it's annoying in this context
                'group-focus-within/dropdown:group-hover/dropdown:visible' // When the dropdown is already open, it should remain visible when hovered
            )}
            button={
                <div
                    data-testid="space-dropdown-button"
                    className={tcls(
                        'flex',
                        'flex-row',
                        'items-center',
                        'transition-all',
                        'hover:cursor-pointer',

                        'px-3',
                        'py-2',
                        'gap-2',

                        'rounded-md',
                        'straight-corners:rounded-none',

                        'bg-tint-base',

                        'text-sm',
                        'text-tint',
                        'hover:text-tint-strong',
                        'data-[state=open]:text-tint-strong',

                        'ring-1',
                        'ring-tint-subtle',
                        'hover:ring-tint-hover',
                        'data-[state=open]:ring-tint-hover',

                        'contrast-more:bg-tint-base',
                        'contrast-more:ring-1',
                        'contrast-more:hover:ring-2',
                        'contrast-more:data-[state=open]:ring-2',
                        'contrast-more:ring-tint',
                        'contrast-more:hover:ring-tint-hover',
                        'contrast-more:data-[state=open]:ring-tint-hover',

                        className
                    )}
                >
                    <span className={tcls('line-clamp-1', 'grow')}>{siteSpace.title}</span>
                    <DropdownChevron />
                </div>
            }
        >
                {siteSpaces.map((otherSiteSpace, index) => (
                    <SpacesDropdownMenuItem
                        key={`${otherSiteSpace.id}-${index}`}
                        variantSpace={{
                            id: otherSiteSpace.id,
                            title: otherSiteSpace.title,
                            url: otherSiteSpace.urls.published
                                ? linker.toLinkForContent(otherSiteSpace.urls.published)
                                : otherSiteSpace.space.urls.app,
                        }}
                        active={otherSiteSpace.id === siteSpace.id}
                    />
                ))}
        </DropdownMenu>
    );
}
