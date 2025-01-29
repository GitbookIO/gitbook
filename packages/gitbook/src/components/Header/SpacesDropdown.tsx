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

                        'bg-gray-base',
                        'group-hover/dropdown:bg-gray-base',
                        'group-focus-within/dropdown:bg-gray-base',

                        'text-sm',
                        'text-gray',
                        'group-hover/dropdown:text-gray-strong',
                        'group-focus-within/dropdown:text-gray-strong',

                        'ring-1',
                        'ring-gray-subtle',
                        'group-hover/dropdown:ring-gray-hover',
                        'group-focus-within/dropdown:ring-gray-hover',

                        'contrast-more:bg-gray-base',
                        'contrast-more:ring-1',
                        'contrast-more:group-hover/dropdown:ring-2',
                        'contrast-more:ring-gray',
                        'contrast-more:group-hover/dropdown:ring-gray-hover',
                        'contrast-more:group-focus-within/dropdown:ring-gray-hover',

                        className,
                    )}
                >
                    <span className={tcls('line-clamp-2', 'grow')}>{space.title}</span>
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
