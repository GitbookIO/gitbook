'use client';

import { useSyncExternalStore } from 'react';

import { type ClassValue, tcls } from '@/lib/tailwind';

const HEADING_ATTR = 'data-heading-reveal-wrapper';

/**
 * Shared store tracking which single heading (by id) currently has its anchor
 * icon revealed, so tapping one heading hides any other that was revealed.
 */
let revealedId: string | null = null;
const listeners = new Set<() => void>();

function handleDocumentClick(event: MouseEvent) {
    const target = event.target;
    if (!(target instanceof Element) || !target.closest(`[${HEADING_ATTR}]`)) {
        setRevealedId(null);
    }
}

function subscribe(onStoreChange: () => void) {
    listeners.add(onStoreChange);
    if (listeners.size === 1) {
        document.addEventListener('click', handleDocumentClick);
    }

    return () => {
        listeners.delete(onStoreChange);
        if (listeners.size === 0) {
            document.removeEventListener('click', handleDocumentClick);
        }
    };
}

function getSnapshot() {
    return revealedId;
}

function getServerSnapshot() {
    return null;
}

function setRevealedId(id: string | null) {
    if (revealedId === id) {
        return;
    }

    revealedId = id;
    for (const listener of listeners) {
        listener();
    }
}

/**
 * Wraps a heading tag with tap-to-reveal state for its anchor-link icon on
 * touch devices, where hover isn't available to reveal it.
 * Only one heading can be revealed at a time, and tapping outside of any
 * heading clears it.
 */
export function HeadingRevealWrapper(props: {
    as: React.ElementType;
    id: string;
    className?: ClassValue;
    children: React.ReactNode;
}) {
    const { as: Tag, id, className, children, ...rest } = props;
    const currentRevealedId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const revealed = currentRevealedId === id;

    const handlePointerUp = (event: React.PointerEvent<HTMLElement>) => {
        if (event.pointerType === 'mouse' && window.matchMedia('(hover: hover)').matches) {
            return;
        }

        const target = event.target;
        if (
            target instanceof Element &&
            target.closest('a, button, input, select, textarea, [role="button"]')
        ) {
            return;
        }
        setRevealedId(revealed ? null : id);
    };

    return (
        <Tag
            id={id}
            className={tcls(className, revealed && 'hash-revealed')}
            onPointerUp={handlePointerUp}
            {...{ [HEADING_ATTR]: true }}
            {...rest}
        >
            {children}
        </Tag>
    );
}
