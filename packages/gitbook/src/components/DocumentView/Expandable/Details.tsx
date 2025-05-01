'use client';

import React from 'react';

import { useHash } from '@/components/hooks';
import { type ClassValue, tcls } from '@/lib/tailwind';

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
                'bg-tint-base',
                'border',
                'border-b-0',
                'border-tint-subtle',
                //all
                'mt-0!',
                //select first child
                'first:mt-5!',
                'first:rounded-t-lg',
                //select first in group
                '[:not(&)_+&]:mt-5!',
                '[:not(&)_+&]:rounded-t-lg',
                //select last in group
                '[&:not(:has(+_&))]:mb-5',
                '[&:not(:has(+_&))]:rounded-b-lg',
                '[&:not(:has(+_&))]:border-b'
            )}
        >
            {children}
        </details>
    );
}
