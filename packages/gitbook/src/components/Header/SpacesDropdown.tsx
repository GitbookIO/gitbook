import type { SiteSpace } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import type { GitBookSiteContext } from '@v2/lib/context';
import { Dropdown, DropdownChevron, DropdownMenu } from './Dropdown';
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
        <Dropdown
            className={tcls(
                'group-hover/dropdown:invisible', // Prevent hover from opening the dropdown, as it's annoying in this context
                'group-focus-within/dropdown:group-hover/dropdown:visible' // When the dropdown is already open, it should remain visible when hovered
            )}
            button={(buttonProps) => (
                <div
                    {...buttonProps}
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
                        'group-hover/dropdown:bg-tint-base',
                        'group-focus-within/dropdown:bg-tint-base',

                        'text-sm',
                        'text-tint',
                        'group-hover/dropdown:text-tint-strong',
                        'group-focus-within/dropdown:text-tint-strong',

                        'ring-1',
                        'ring-tint-subtle',
                        'group-hover/dropdown:ring-tint-hover',
                        'group-focus-within/dropdown:ring-tint-hover',

                        'contrast-more:bg-tint-base',
                        'contrast-more:ring-1',
                        'contrast-more:group-hover/dropdown:ring-2',
                        'contrast-more:ring-tint',
                        'contrast-more:group-hover/dropdown:ring-tint-hover',
                        'contrast-more:group-focus-within/dropdown:ring-tint-hover',

                        className
                    )}
                >
                    <span className={tcls('line-clamp-1', 'grow')}>{siteSpace.title}</span>
                    <DropdownChevron />
                </div>
            )}
        >
            <DropdownMenu>
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
        </Dropdown>
    );
}
