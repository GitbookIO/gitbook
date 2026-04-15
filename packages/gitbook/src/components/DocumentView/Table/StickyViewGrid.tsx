'use client';
import { useScrollListener } from '@/components/hooks/useScrollListener';
import { tcls } from '@/lib/tailwind';
import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef } from 'react';

interface StickyViewGridProps {
    className?: string;
    header?: ReactNode;
    stickyHeader?: boolean;
    tableClassName?: string;
    children: ReactNode;
}

export function StickyViewGrid({
    className,
    header,
    stickyHeader = false,
    tableClassName,
    children,
}: StickyViewGridProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const stickyHeaderRef = useRef<HTMLDivElement>(null);
    const bodyScrollRef = useRef<HTMLDivElement>(null);
    const bodyTableRef = useRef<HTMLDivElement>(null);

    const onStickyHeaderWheel = useCallback((event: WheelEvent) => {
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

    useEffect(() => {
        const stickyHeaderElement = stickyHeaderRef.current;
        if (!stickyHeaderElement) {
            return;
        }

        stickyHeaderElement.addEventListener('wheel', onStickyHeaderWheel, { passive: false });

        return () => {
            stickyHeaderElement.removeEventListener('wheel', onStickyHeaderWheel);
        };
    }, [onStickyHeaderWheel]);

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
        const bodyScrollElement = bodyScrollRef.current;
        const bodyTableElement = bodyTableRef.current;

        if (!bodyScrollElement && !bodyTableElement) {
            return;
        }

        const resizeObserver = new ResizeObserver(syncStickyLayout);

        if (bodyScrollElement) {
            resizeObserver.observe(bodyScrollElement);
        }

        if (bodyTableElement) {
            resizeObserver.observe(bodyTableElement);
        }

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
                    stickyHeader ? 'data-[scrollable=true]:border' : undefined
                )}
                data-scrollable="false"
            >
                {stickyHeader && header ? (
                    <div
                        ref={stickyHeaderRef}
                        className={tcls(
                            'sticky z-20 w-full min-w-0 max-w-full overflow-hidden rounded-t-[inherit]',
                            '[top:var(--toc-top-offset,var(--outline-top-offset,0px))]'
                        )}
                    >
                        <div
                            className={tcls(
                                'flex',
                                'flex-col',
                                tableClassName ?? 'w-fit',
                                '[transform:translateX(var(--table-sticky-scroll-left,0px))]'
                            )}
                            style={{ width: 'var(--table-sticky-table-width)' }}
                        >
                            {header}
                        </div>
                    </div>
                ) : null}

                <div
                    ref={bodyScrollRef}
                    className={tcls(
                        'w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-none border-tint-subtle',
                        stickyHeader
                            ? [
                                  'group-data-[scrollable=true]/table:mx-px',
                                  'group-data-[scrollable=true]/table:border-0',
                                  'group-data-[scrollable=true]/table:rounded-none',
                              ]
                            : undefined
                    )}
                >
                    <div
                        ref={bodyTableRef}
                        className={tcls('flex', 'flex-col', tableClassName ?? 'w-fit')}
                    >
                        {!stickyHeader ? header : null}
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
