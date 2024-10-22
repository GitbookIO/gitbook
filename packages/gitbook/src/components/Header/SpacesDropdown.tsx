import { Space } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { Dropdown, DropdownChevron, DropdownMenu } from './Dropdown';
import { SpacesDropdownMenuItem } from './SpacesDropdownMenuItem';

export function SpacesDropdown(props: { space: Space; spaces: Space[] }) {
    const { space, spaces } = props;

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
                        'bg-light-2',
                        'border',
                        'border-light-3',
                        'text-dark-4',
                        'text-sm',
                        'px-3',
                        'py-1',
                        'contrast-more:border-dark',
                        'contrast-more:bg-light',
                        'contrast-more:text-dark',
                        'dark:bg-dark-3',
                        'dark:border-dark-4',
                        'dark:text-light-4',
                        'contrast-more:dark:border-light',
                        'contrast-more:dark:bg-dark',
                        'contrast-more:dark:text-light',
                    )}
                >
                    {space.title}
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
