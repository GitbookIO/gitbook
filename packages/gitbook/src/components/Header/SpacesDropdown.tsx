import { Space } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { Dropdown, DropdownChevron, DropdownMenu } from './Dropdown';
import { SpacesDropdownMenuItem } from './SpacesDropdownMenuItem';

export function SpacesDropdown(props: { space: Space; spaces: Space[]; className?: string }) {
    const { space, spaces, className } = props;

    return (
        <Dropdown
            className={tcls(
                'group-hover/dropdown:invisible', // Prevent hover from opening the dropdown, as it's annoying in this context
                'group-focus-within/dropdown:group-hover/dropdown:visible', // When the dropdown is already open, it should remain visible when hovered
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

                        'bg-light',
                        'group-hover/dropdown:bg-light-1',
                        'group-focus-within/dropdown:bg-light-1',
                        'dark:bg-dark-1',
                        'dark:group-hover/dropdown:bg-dark-3',
                        'dark:group-focus-within/dropdown:bg-dark-3',

                        'text-sm',
                        'text-dark-4',
                        'group-hover/dropdown:text-dark',
                        'group-focus-within/dropdown:text-dark',
                        'dark:text-light-4',
                        'dark:group-hover/dropdown:text-light',
                        'dark:group-focus-within/dropdown:text-light',

                        'ring-1',
                        'ring-dark/2',
                        'group-hover/dropdown:ring-dark/4',
                        'group-focus-within/dropdown:ring-dark/4',
                        'dark:ring-light/2',
                        'dark:group-hover/dropdown:ring-light/4',
                        'dark:group-focus-within/dropdown:ring-light/4',

                        'contrast-more:bg-light',
                        'dark:contrast-more:bg-dark',
                        'contrast-more:ring-1',
                        'contrast-more:group-hover/dropdown:ring-2',
                        'contrast-more:ring-dark',
                        'contrast-more:group-hover/dropdown:ring-dark',
                        'contrast-more:group-focus-within/dropdown:ring-dark',
                        'dark:contrast-more:ring-light',
                        'dark:contrast-more:group-hover/dropdown:ring-light',
                        'dark:contrast-more:group-focus-within/dropdown:ring-light',

                        className,
                    )}
                >
                    <span className={tcls('line-clamp-1', 'grow')}>{space.title}</span>
                    <DropdownChevron />
                </div>
            )}
        >
            <DropdownMenu>
                {spaces.map((otherSpace, index) => (
                    <SpacesDropdownMenuItem
                        key={`${otherSpace.id}-${index}`}
                        variantSpace={{
                            id: otherSpace.id,
                            title: otherSpace.title,
                            url: otherSpace.urls.published ?? otherSpace.urls.app,
                        }}
                        active={otherSpace.id === space.id}
                    />
                ))}
            </DropdownMenu>
        </Dropdown>
    );
}
