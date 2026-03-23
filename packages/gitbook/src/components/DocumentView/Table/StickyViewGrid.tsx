'use client';
import { useScrollListener } from '@/components/hooks/useScrollListener';
import { tcls } from '@/lib/tailwind';
import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef } from 'react';

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
    }, [syncStickyLayout]);

    useScrollListener(syncStickyLayout, bodyScrollRef);

    useEffect(() => {
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
            <div
                ref={rootRef}
                className={tcls(
                    'group/table relative flex w-full min-w-0 max-w-full flex-col rounded-lg border-tint-subtle',
                    'data-[scrollable=true]:border'
                )}
                data-scrollable="false"
            >
                <div
                    className={tcls(
                        '-mx-px sticky z-10 w-full min-w-0 max-w-full overflow-hidden px-px',
                        '[top:calc(var(--toc-top-offset,var(--outline-top-offset,0px))+8px)]'
                    )}
                    onWheel={onStickyHeaderWheel}
                >
                    <div
                        className={tcls(
                            'flex',
                            'flex-col',
                            'w-fit',
                            '[transform:translateX(var(--table-sticky-scroll-left,0px))]'
                        )}
                        style={{ width: 'var(--table-sticky-table-width)' }}
                    >
                        {header}
                    </div>
                </div>

                <div
                    ref={bodyScrollRef}
                    className={tcls(
                        styles.tableScrollArea,
                        'w-full min-w-0 overflow-x-auto overflow-y-hidden border-tint-subtle',
                        'group-data-[scrollable=true]/table:border-0',
                        'group-data-[scrollable=true]/table:rounded-none'
                    )}
                >
                    <div ref={bodyTableRef} className={tcls('flex', 'flex-col', 'w-fit')}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
