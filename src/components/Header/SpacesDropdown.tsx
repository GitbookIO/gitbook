import { Collection, Space } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { Dropdown, DropdownChevron, DropdownMenu, DropdownMenuItem } from './Dropdown';

export function SpacesDropdown(props: { space: Space; spaces: Space[] }) {
    const { space, spaces } = props;

    return (
        <Dropdown
            button={(buttonProps) => (
                <div
                    {...buttonProps}
                    className={tcls(
                        'justify-self-start',
                        'flex',
                        'flex-row',
                        'items-center',
                        'px-3',
                        'py-1.5',
                        'text-header-link-500',
                    )}
                >
                    {space.title}
                    <DropdownChevron />
                </div>
            )}
        >
            <DropdownMenu>
                {spaces.map((otherSpace) => (
                    <DropdownMenuItem
                        key={otherSpace.id}
                        href={otherSpace.urls.published ?? otherSpace.urls.app}
                        active={otherSpace.id === space.id}
                    >
                        {otherSpace.title}
                    </DropdownMenuItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
}
