'use client';

import type React from 'react';

import { Icon } from '@gitbook/icons';

import { ToggleChevron } from '../primitives';
import { DropdownMenu } from '../primitives/DropdownMenu';
import { type ClassValue, tcls } from '@/lib/tailwind';

/**
 * Client component for the "More" header link dropdown.
 * Creates the trigger button internally to avoid Flight lazy chunk wrappers reaching the trigger's
 * `render` prop.
 */
export function HeaderLinkMoreDropdown(props: {
    label: React.ReactNode;
    dropdownClassName: ClassValue;
    children: React.ReactNode;
}) {
    const { label, dropdownClassName, children } = props;

    return (
        <DropdownMenu
            button={
                <button
                    type="button"
                    className={tcls(
                        'text-tint',
                        'hover:text-primary',
                        'dark:hover:text-primary',
                        'theme-bold:text-header-link',
                        'theme-bold:hover:text-header-link/8',
                        'flex',
                        'gap-1',
                        'items-center'
                    )}
                >
                    <span className="sr-only">{label}</span>
                    <Icon icon="ellipsis" className={tcls('size-4')} />
                    <ToggleChevron />
                </button>
            }
            openOnHover={true}
            className={dropdownClassName}
        >
            {children}
        </DropdownMenu>
    );
}
