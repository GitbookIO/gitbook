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
                        'gap-2',

                        'straight-corners:rounded-none',
                        'rounded-2xl',
                        'border-1',
                        'shadow-[0_0_2px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.12)]',
                        'dark:shadow-[0_1px_2px_rgba(0,0,0,0.5),0_0_1px_rgba(0,0,0,0.3)]',
                        'hover:cursor-pointer',
                        'bg-light',
                        'dark:bg-dark-3',

                        'text-sm',
                        'text-dark-4',
                        'dark:text-light-4',

                        'contrast-more:bg-light',
                        'contrast-more:ring-1',
                        'contrast-more:ring-dark',
                        'dark:contrast-more:ring-light',
                        'dark:contrast-more:bg-dark',

                        'px-3',
                        'py-1.5',
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
