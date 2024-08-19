'use client'

import { useParams } from 'next/navigation';
import React from 'react';

import { ClassValue, tcls } from '@/lib/tailwind';


/**
 * Details component rendered on client so it can expand dependent on url hash changes.
 */
export function Details(props: { children : React.ReactNode; id: string; contentIds?: string[]; open?: boolean; className?: ClassValue; }) {
    const { children, id, contentIds = [], open, className } = props;
    const params = useParams();
    const [hash, setHash] = React.useState<string | null>(null);
    
    React.useEffect(() => {
        function updateHash() {
            const urlHash = global?.location?.hash;
            if (urlHash !== hash) {
                setHash(urlHash.slice(1));
                const element = document.getElementById(urlHash.slice(1));
                if (element) {
                    element.scrollIntoView({
                        block: 'start',
                        behavior: 'smooth',
                    });
                }
            }
        }
        addEventListener('hashchange', updateHash);
        updateHash();
        return () => removeEventListener('hashchange', updateHash); 
    }, [params, hash, open])
    
    const isOpen = open || [id, ...contentIds].some(id => hash === id);

    return (
        <details
            id={id}
            open={isOpen}
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
