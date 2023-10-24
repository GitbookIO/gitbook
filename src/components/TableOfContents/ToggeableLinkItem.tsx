'use client';

import { tcls } from '@/lib/tailwind';
import Link, { LinkProps } from 'next/link';
import React from 'react';

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

    return (
        <>
            <Link {...linkProps}>
                {children}
                <button
                    className={tcls('px-1')}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setOpen(!open);
                    }}
                >
                    {open ? '▼' : '▶'}
                </button>
            </Link>
            {open ? descendants : null}
        </>
    );
}
