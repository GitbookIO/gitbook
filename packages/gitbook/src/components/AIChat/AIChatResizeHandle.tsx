'use client';

import { tcls } from '@/lib/tailwind';
import React from 'react';
import { useAIChatWidthStore } from './useAIChatWidthStore';

/**
 * Set the global flag that suppresses transitions while the panel is being dragged.
 */
function setResizing(active: boolean) {
    if (active) {
        document.documentElement.dataset.aiChatResizing = 'true';
    } else {
        document.documentElement.dataset.aiChatResizing = 'false';
    }
}

/**
 * Drag handle on the panel's left edge to resize the AI chat.
 */
export function AIChatResizeHandle() {
    const { width, setWidth } = useAIChatWidthStore();
    const frameRef = React.useRef<number | null>(null);
    const widthRef = React.useRef(width);

    // Re-apply the viewport cap on window resize; clean up on unmount.
    React.useEffect(() => {
        const onResize = () => useAIChatWidthStore.getState().syncWidth();
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
            if (frameRef.current !== null) {
                cancelAnimationFrame(frameRef.current);
            }
            setResizing(false);
        };
    }, []);

    const commitWidth = (width: number) => {
        widthRef.current = setWidth(width);
    };

    // Release the pointer and stop the resize interaction without committing a new width.
    const stopResizing = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        if (frameRef.current !== null) {
            cancelAnimationFrame(frameRef.current);
            frameRef.current = null;
        }
        setResizing(false);
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        setResizing(true);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
            return;
        }
        // Panel is right-anchored, so its width is the distance from the cursor to the right edge.
        widthRef.current = window.innerWidth - event.clientX;
        if (frameRef.current === null) {
            frameRef.current = requestAnimationFrame(() => {
                frameRef.current = null;
                widthRef.current = setWidth(widthRef.current);
            });
        }
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
            return;
        }
        commitWidth(widthRef.current);
        stopResizing(event);
    };

    return (
        <div
            aria-hidden="true"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={tcls(
                'group -translate-x-1/2 absolute inset-y-0 left-0 z-10 hidden w-3 cursor-col-resize touch-none lg:flex',
                'items-stretch justify-center'
            )}
        >
            <span className="h-full w-px rounded-full bg-transparent transition-all duration-150 ease-out group-hover:w-0.5 group-hover:bg-primary-solid/40 group-active:w-0.5 group-active:bg-primary-solid" />
        </div>
    );
}
