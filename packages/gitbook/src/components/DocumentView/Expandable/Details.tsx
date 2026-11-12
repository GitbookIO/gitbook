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
    /** Node key of the expandable, so comments can anchor to it. */
    commentKey?: string;
}) {
    const { children, id, className } = props;

    const ref = React.useRef<HTMLDetailsElement>(null);

    const [openFromHash, setOpenFromHash] = React.useState(false);

    const hash = useHash();

    /**
     * Open the details element if the url hash refers to the id of the details element
     * or the id of some element contained within the details element.
     */
    React.useEffect(() => {
        if (!hash || !ref.current) {
            return;
        }

        if (hash === id) {
            setOpenFromHash(true);
            return;
        }

        const activeElement = document.getElementById(hash);
        const isOpen = Boolean(activeElement && ref.current.contains(activeElement));
        setOpenFromHash(isOpen);
    }, [hash, id]);

    return (
        <details
            ref={ref}
            id={id}
            data-block-key={props.commentKey}
            open={props.open || openFromHash}
            // Styles live on `.expandable` in `Expandable.css`; the group name is matched literally.
            className={tcls(className, 'expandable', 'group/expandable')}
        >
            {children}
        </details>
    );
}
