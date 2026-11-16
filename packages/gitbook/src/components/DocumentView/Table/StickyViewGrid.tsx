'use client';
import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import { useScrollListener } from '@/components/hooks/useScrollListener';
import { cx } from '@/lib/classnames';

interface StickyViewGridProps {
    className?: string;
    header?: ReactNode;
    stickyHeader?: boolean;
    tableClassName?: string;
    withTableRole?: boolean;
    children: ReactNode;
}

export function StickyViewGrid(props: StickyViewGridProps) {
    if (props.stickyHeader) {
        return <StickyHeaderOverlayScrollGrid {...props} />;
    }
    return <DefaultHeaderScrollGrid {...props} />;
}

function DefaultHeaderScrollGrid({
    className,
    header,
    tableClassName,
    withTableRole = true,
    children,
}: StickyViewGridProps) {
    const resolvedTableClassName = tableClassName ?? 'w-fit';

    return (
        <div className={className}>
            <div role={withTableRole ? 'table' : undefined} className="group/table table-sticky">
                <div className="table-scroll">
                    <div className={cx('table-stack', resolvedTableClassName)}>
                        {header}
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StickyHeaderOverlayScrollGrid({
    className,
    header,
    tableClassName,
    withTableRole = true,
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

    const resolvedTableClassName = tableClassName ?? 'w-fit';

    return (
        <div className={className}>
            <div
                ref={rootRef}
                className="group/table table-sticky"
                data-scrollable="false"
                role={withTableRole ? 'table' : undefined}
            >
                {header ? (
                    <div ref={stickyHeaderRef} className="table-sticky-header">
                        <div
                            className={cx('table-sticky-header-track', resolvedTableClassName)}
                            style={{ width: 'var(--table-sticky-table-width)' }}
                        >
                            {header}
                        </div>
                    </div>
                ) : null}

                <div ref={bodyScrollRef} className="table-scroll table-sticky-scroll">
                    <div ref={bodyTableRef} className={cx('table-stack', resolvedTableClassName)}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
