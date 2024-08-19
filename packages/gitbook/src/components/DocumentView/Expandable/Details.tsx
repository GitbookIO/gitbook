'use client'

import React from 'react';

import { ClassValue, tcls } from '@/lib/tailwind';
import { useParams } from 'next/navigation';

function useHash() {
    const params = useParams();
    const [hash, setHash] = React.useState<string>(global.location?.hash?.slice(1));
    React.useEffect(() => {
        function updateHash() {
            setHash( global.location?.hash?.slice(1));
        }
        global.addEventListener('hashchange', updateHash);
        updateHash();
        return () => global.removeEventListener('hashchange', updateHash); 
    }, [params]);
    return hash;
}
/**
 * Details component rendered on client so it can expand dependent on url hash changes.
 */
export function Details(props: { children : React.ReactNode; id: string; contentIds?: string[]; open?: boolean; className?: ClassValue; }) {
    const { children, id, open, className } = props;
    
    const detailsRef = React.useRef<HTMLDetailsElement>(null);

    const [anchorElement, setAnchorElement] = React.useState<Element | null | undefined>();

    const hash = useHash();
    React.useEffect(() => {
        if (!hash) { return; }
        const descendant = hash === id ? detailsRef.current : detailsRef.current?.querySelector(`#${hash}`);
        setAnchorElement(descendant);
    }, [hash, id]);


    React.useLayoutEffect(() => {
        if (anchorElement) {
            anchorElement.scrollIntoView({
                block: 'start',
                behavior: 'smooth',
            });
        }
    }, [anchorElement]);

    return (
        <details
            ref={detailsRef}
            id={id}
            open={open || Boolean(anchorElement)}
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
