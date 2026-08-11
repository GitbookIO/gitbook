'use client';

import type { IconName } from '@gitbook/icons';

import { useSelectedSiteSpaceId } from '../hooks';
import { Button, type ButtonProps, ToggleChevron } from '../primitives';
import { DropdownMenu } from '../primitives/DropdownMenu';
import { SpacesDropdownMenuItems, type VariantSpace } from './SpacesDropdownMenuItem';
import { type ClassValue, tcls } from '@/lib/tailwind';

/**
 * Client component that creates the Button trigger and DropdownMenu internally, avoiding
 * server→client element serialization through the trigger's `render` prop.
 */
export function SpacesDropdownClient(props: {
    title: string;
    icon?: IconName;
    variant: ButtonProps['variant'];
    className?: ClassValue;
    dropdownClassName: string;
    slimSpaces: VariantSpace[];
    /** Site space the server rendered as selected, used as a fallback. */
    siteSpaceId: string;
    curPath: string;
}) {
    const { title, icon, variant, className, dropdownClassName, slimSpaces, siteSpaceId, curPath } =
        props;

    const selectedId = useSelectedSiteSpaceId(siteSpaceId);
    const selected = selectedId ? slimSpaces.find((space) => space.id === selectedId) : undefined;

    return (
        <DropdownMenu
            className={dropdownClassName}
            button={
                <Button
                    icon={icon}
                    data-testid="space-dropdown-button"
                    size="small"
                    variant={variant}
                    trailing={<ToggleChevron />}
                    className={tcls('bg-tint-base', className)}
                >
                    <span className="button-content">{selected?.title ?? title}</span>
                </Button>
            }
        >
            <SpacesDropdownMenuItems
                slimSpaces={slimSpaces}
                selectedId={selectedId}
                curPath={selected?.path ?? curPath}
            />
        </DropdownMenu>
    );
}
