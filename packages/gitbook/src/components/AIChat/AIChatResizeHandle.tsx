'use client';

import { tcls } from '@/lib/tailwind';
import React from 'react';
import { useAIChatWidthStore } from './useAIChatWidthStore';

function setResizing(active: boolean) {
    document.documentElement.dataset.aiChatResizing = String(active);
}

export function AIChatResizeHandle() {
    const setWidth = useAIChatWidthStore((state) => state.setWidth);
    const frameRef = React.useRef<number | null>(null);
    const widthRef = React.useRef(0);

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
        widthRef.current = useAIChatWidthStore.getState().width;
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
        setWidth(widthRef.current);
        stopResizing(event);
    };

    return (
        <div
            aria-hidden="true"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={stopResizing}
            className={tcls(
                'group -translate-x-1/2 absolute inset-y-0 left-0 z-10 hidden w-3 cursor-col-resize touch-none lg:flex',
                'items-stretch justify-center'
            )}
        >
            <span className="h-full w-px rounded-full bg-transparent transition-all duration-150 ease-out group-hover:w-0.5 group-hover:bg-primary-solid/40 group-active:w-0.5 group-active:bg-primary-solid" />
        </div>
    );
}
