'use client';

import { tcls } from '@/lib/tailwind';
import Link, { LinkProps } from 'next/link';
import React from 'react';

import { IconChevronDown } from '@/components/icons/IconChevronDown';
import { IconChevronRight } from '@/components/icons/IconChevronRight';

/**
 * Client component to allow toggling of a page's children.
 */
export function ToggeableLinkItem(
    props: LinkProps & {
        className?: string;
        children: React.ReactNode;
        descendants?: React.ReactNode;
        defaultOpen?: boolean;
    },
) {
    const { children, descendants, defaultOpen = false, ...linkProps } = props;

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
                        'text-slate-600',
                        'rounded',
                        'hover:bg-slate-200',
                        'hover:text-slate-700',
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
