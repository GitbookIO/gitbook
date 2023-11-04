import { Collection, Space } from '@gitbook/api';
import IconChevronDown from '@geist-ui/icons/chevrondown';
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
            dropdown={
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
            }
        >
            <div
                className={tcls(
                    'flex',
                    'flex-row',
                    'items-center',
                    'text-base',
                    'rounded-full',
                    'px-3',
                    'py-1',
                    'bg-header-background-400',
                    'text-header-link-500',
                )}
            >
                {space.title}
                <DropdownChevron />
            </div>
        </Dropdown>
    );
}
