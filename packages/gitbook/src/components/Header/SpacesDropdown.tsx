import { Space } from '@gitbook/api';

import { getSpaceLayoutData } from '@/lib/api';
import { tcls } from '@/lib/tailwind';
import { getSpaceTitle } from '@/lib/utils';

import { Dropdown, DropdownChevron, DropdownMenu } from './Dropdown';
import { SpacesDropdownMenuItem } from './SpacesDropdownMenuItem';

export async function SpacesDropdown(props: { space: Space; spaces: Space[] }) {
    const { space, spaces } = props;

    // fetch space layout data such as customizations
    const spacesLayoutData = await Promise.all(
        spaces.map(async (space) => [space.id, await getSpaceLayoutData(space.id)]),
    );

    // Map using space IDs as keys for convenience
    const spacesLayoutMap = spacesLayoutData.reduce((accum, layoutKeyVal) => {
        accum.set(layoutKeyVal[0], layoutKeyVal[1]);
        return accum;
    }, new Map());

    return (
        <Dropdown
            button={(buttonProps) => (
                <div
                    {...buttonProps}
                    data-testid="space-dropdown-button"
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
                    {getSpaceTitle({
                        space,
                        customization: spacesLayoutMap.get(space.id)?.customization ?? {},
                        parent: null,
                    })}
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
                            title: getSpaceTitle({
                                space: otherSpace,
                                customization:
                                    spacesLayoutMap.get(otherSpace.id)?.customization ?? {},
                                parent: null,
                            }),
                            url: otherSpace.urls.published ?? otherSpace.urls.app,
                        }}
                        active={otherSpace.id === space.id}
                    />
                ))}
            </DropdownMenu>
        </Dropdown>
    );
}
