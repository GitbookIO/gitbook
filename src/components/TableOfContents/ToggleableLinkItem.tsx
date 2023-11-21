'use client';

import Link, { LinkProps } from 'next/link';
import React from 'react';

import { IconChevronDown } from '@/components/icons/IconChevronDown';
import { IconChevronRight } from '@/components/icons/IconChevronRight';
import { tcls } from '@/lib/tailwind';

/**
 * Client component to allow toggling of a page's children.
 */
export function ToggleableLinkItem(
    props: LinkProps & {
        className?: string;
        children: React.ReactNode;
        descendants?: React.ReactNode;
        defaultOpen?: boolean;
        isActive?: boolean;
    },
) {
    const { children, descendants, defaultOpen = false, isActive = false, ...linkProps } = props;

    const [open, setOpen] = React.useState(defaultOpen);
    const Chevron = open ? IconChevronDown : IconChevronRight;

    return (
        <>
            <Link {...linkProps}>
                {children}
                <Chevron
                    className={tcls(
                        'w-5',
                        'h-5',
                        'p-0.5',
                        'text-current',
                        'rounded',
                        'hover:bg-dark/2',
                        'hover:text-current',
                        'dark:hover:bg-light/2',
                        'dark:hover:text-current',
                        'transition-colors',
                        isActive ? ['hover:bg-primary-500/5', 'dark:hover:bg-primary-500/5'] : [],
                    )}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setOpen(!open);
                    }}
                />
            </Link>
            {open ? descendants : null}
        </>
    );
}
