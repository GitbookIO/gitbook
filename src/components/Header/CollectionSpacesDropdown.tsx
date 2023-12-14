import { Collection, Space } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { Dropdown, DropdownChevron, DropdownMenu, DropdownMenuItem } from './Dropdown';

export function CollectionSpacesDropdown(props: {
    space: Space;
    collection: Collection;
    collectionSpaces: Space[];
}) {
    const { space, collectionSpaces } = props;

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
                        'text-base',
                        'rounded-full',
                        'px-3',
                        'py-1',
                        'bg-dark/2',
                        'dark:bg-light/2',
                        /*                         'text-header-link-500', */
                    )}
                >
                    {space.title}
                    <DropdownChevron />
                </div>
            )}
        >
            <DropdownMenu>
                {collectionSpaces.map((otherSpace) => (
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
