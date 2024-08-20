'use client';

import React from 'react';

import { useHash } from '@/components/hooks';
import { ClassValue, tcls } from '@/lib/tailwind';

/**
 * Details component rendered on client so it can expand dependent on url hash changes.
 */
export function Details(props: {
    children: React.ReactNode;
    id: string;
    contentIds?: string[];
    open?: boolean;
    className?: ClassValue;
}) {
    const { children, id, className } = props;

    const detailsRef = React.useRef<HTMLDetailsElement>(null);

    const [openFromHash, setOpenFromHash] = React.useState(false);

    const hash = useHash();
    /**
     * Open the details element if the url hash refers to the id of the details element
     * or the id of some element contained within the details element.
     */
    React.useEffect(() => {
        if (!hash || !detailsRef.current) {
            return;
        }
        if (hash === id) {
            setOpenFromHash(true);
        }
        const activeElement = document.getElementById(hash);
        setOpenFromHash(Boolean(activeElement && detailsRef.current?.contains(activeElement)));
    }, [hash, id]);

    return (
        <details
            ref={detailsRef}
            id={id}
            open={props.open || openFromHash}
            className={tcls(
                className,
                'group/expandable',
                'shadow-dark/1',
                'bg-gradient-to-t',
                'from-light-1',
                'to-light-1',
                'border',
                'border-b-0',
                'border-dark-3/3',
                //all
                '[&]:mt-[0px]',
                //select first child
                '[&:first-child]:mt-5',
                '[&:first-child]:rounded-t-lg',
                //select first in group
                '[:not(&)_+&]:mt-5',
                '[:not(&)_+&]:rounded-t-lg',
                //select last in group
                '[&:not(:has(+_&))]:mb-5',
                '[&:not(:has(+_&))]:rounded-b-lg',
                '[&:not(:has(+_&))]:border-b',
                /* '[&:not(:has(+_&))]:shadow-1xs', */

                'dark:border-light-2/[0.06]',
                'dark:from-dark-2',
                'dark:to-dark-2',
                'dark:shadow-none',

                'group open:dark:to-dark-2/8',
                'group open:to-light-1/6',
            )}
        >
            {children}
        </details>
    );
}
