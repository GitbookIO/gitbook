import { Space } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { Dropdown, DropdownChevron, DropdownMenu } from './Dropdown';
import { SpacesDropdownMenuItem } from './SpacesDropdownMenuItem';

export function SpacesDropdown(props: { space: Space; spaces: Space[]; className?: string }) {
    const { space, spaces, className } = props;

    return (
        <Dropdown
            button={(buttonProps) => (
                <div
                    {...buttonProps}
                    data-testid="space-dropdown-button"
                    className={tcls(
                        'flex',
                        'flex-row',
                        'items-center',
                        'rounded-2xl',
                        'straight-corners:rounded-none',

                        'hover:cursor-pointer',
                        'bg-dark/1',
                        'dark:bg-light/1',

                        'text-sm',
                        'text-dark-4',
                        'dark:text-light-4',

                        'contrast-more:bg-light',
                        'contrast-more:ring-1',
                        'contrast-more:ring-dark',
                        'dark:contrast-more:ring-light',
                        'dark:contrast-more:bg-dark',

                        'px-3',
                        'py-1',
                        className,
                    )}
                >
                    <span className="line-clamp-2">{space.title}</span>
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
