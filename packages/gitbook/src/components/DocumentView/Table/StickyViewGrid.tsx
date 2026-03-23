'use client';
import { tcls } from '@/lib/tailwind';
import { type ReactNode, useCallback, useLayoutEffect, useRef } from 'react';

import styles from './table.module.css';

interface StickyViewGridProps {
    className?: string;
    header: ReactNode;
    children: ReactNode;
}

export function StickyViewGrid({ className, header, children }: StickyViewGridProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const bodyScrollRef = useRef<HTMLDivElement>(null);
    const bodyTableRef = useRef<HTMLDivElement>(null);

    const onStickyHeaderWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
        const bodyScrollElement = bodyScrollRef.current;
        if (!bodyScrollElement) {
            return;
        }

        const horizontalDelta = event.deltaX || (event.shiftKey && event.deltaY ? event.deltaY : 0);
        if (horizontalDelta === 0) {
            return;
        }

        bodyScrollElement.scrollLeft += horizontalDelta;
        event.preventDefault();
    }, []);

    const syncStickyLayout = useCallback(() => {
        const rootElement = rootRef.current;
        const bodyScrollElement = bodyScrollRef.current;
        const bodyTableElement = bodyTableRef.current;
        if (!rootElement || !bodyScrollElement || !bodyTableElement) {
            return;
        }

        rootElement.style.setProperty(
            '--table-sticky-scroll-left',
            `${-bodyScrollElement.scrollLeft}px`
        );
        rootElement.style.setProperty(
            '--table-sticky-table-width',
            `${bodyTableElement.scrollWidth}px`
        );
        rootElement.dataset.scrollable = `${
            bodyScrollElement.scrollWidth > bodyScrollElement.clientWidth + 1
        }`;
    }, []);
    useLayoutEffect(() => {
        syncStickyLayout();

        const elements = [bodyScrollRef.current, bodyTableRef.current].filter(
            (element): element is HTMLDivElement => Boolean(element)
        );
        if (elements.length === 0) {
            return;
        }

        const resizeObserver = new ResizeObserver(syncStickyLayout);
        elements.forEach((element) => resizeObserver.observe(element));

        return () => {
            resizeObserver.disconnect();
        };
    }, [syncStickyLayout]);

    return (
        <div className={className}>
            <div ref={rootRef} className={styles.stickyTableRoot} data-scrollable="false">
                <div className={styles.stickyHeaderLayer} onWheel={onStickyHeaderWheel}>
                    <div
                        className={tcls('flex', 'flex-col', 'w-fit', styles.stickyHeaderTable)}
                        style={{ width: 'var(--table-sticky-table-width)' }}
                    >
                        {header}
                    </div>
                </div>

                <div
                    ref={bodyScrollRef}
                    className={styles.tableScrollArea}
                    onScroll={syncStickyLayout}
                >
                    <div ref={bodyTableRef} className={tcls('flex', 'flex-col', 'w-fit')}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
