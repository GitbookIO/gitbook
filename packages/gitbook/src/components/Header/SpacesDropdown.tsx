import { Collection, Site, Space } from '@gitbook/api';

import { getContentPointer } from '@/app/(space)/fetch';
import {
    getCurrentSiteCustomization,
    getSiteSpaces,
    getSpaceCustomization,
    getSpaceLayoutData,
} from '@/lib/api';
import { tcls } from '@/lib/tailwind';
import { getSpaceTitle } from '@/lib/utils';

import { Dropdown, DropdownChevron, DropdownMenu } from './Dropdown';
import { SpacesDropdownMenuItem } from './SpacesDropdownMenuItem';

export async function SpacesDropdown(props: {
    space: Space;
    spaces: Space[];
    parent?: Site | Collection | null;
}) {
    const { space, spaces, parent } = props;
    const contentPointer = getContentPointer();

    // fetch customizations based on site vs a legacy space
    let spaceCustomizations = [];
    if ('siteId' in contentPointer) {
        const siteSpaces = await getSiteSpaces({
            organizationId: contentPointer.organizationId,
            siteId: contentPointer.siteId,
        });

        spaceCustomizations = await Promise.all(
            siteSpaces.map(async ({ id, space }) => [
                space.id,
                await getCurrentSiteCustomization({
                    organizationId: contentPointer.organizationId,
                    siteId: contentPointer.siteId,
                    siteSpaceId: id,
                }),
            ]),
        );
    } else {
        spaceCustomizations = await Promise.all(
            spaces.map(async (space) => [space.id, await getSpaceCustomization(space.id)]),
        );
    }

    // Map using space IDs as keys for convenience
    const spaceCustomizationsMap = spaceCustomizations.reduce((accum, layoutKeyVal) => {
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
                        customization: spaceCustomizationsMap.get(space.id) ?? {},
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
                                customization: spaceCustomizationsMap.get(otherSpace.id) ?? {},
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
