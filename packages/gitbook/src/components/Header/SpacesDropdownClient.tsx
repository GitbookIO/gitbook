'use client';

import type { IconName } from '@gitbook/icons';

import { type ClassValue, tcls } from '@/lib/tailwind';
import { Button, type ButtonProps, ToggleChevron } from '../primitives';
import { DropdownMenu } from '../primitives/DropdownMenu';
import { SpacesDropdownMenuItems } from './SpacesDropdownMenuItem';

/**
 * Client component that creates the Button trigger and DropdownMenu internally,
 * avoiding server→client element serialization through Radix's Slot.
 */
export function SpacesDropdownClient(props: {
    title: string;
    icon?: IconName;
    variant: ButtonProps['variant'];
    className?: ClassValue;
    dropdownClassName: string;
    slimSpaces: Array<{
        id: string;
        title: string;
        url: string;
        isActive: boolean;
        spaceId: string;
    }>;
    curPath: string;
}) {
    const { title, icon, variant, className, dropdownClassName, slimSpaces, curPath } = props;

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
                    <span className="button-content">{title}</span>
                </Button>
            }
        >
            <SpacesDropdownMenuItems slimSpaces={slimSpaces} curPath={curPath} />
        </DropdownMenu>
    );
}
