'use client';

import React from 'react';

import { ToggleChevron } from '../primitives';
import type { ClientTOCPageGroup } from './encodeClientTableOfContents';
import { PagesList } from './PagesList';
import { TOCPageIcon } from './TOCPageIcon';
import { cx } from '@/lib/classnames';

export function PageGroupItem(props: { page: ClientTOCPageGroup; isFirst?: boolean }) {
    const { page, isFirst } = props;
    const descendants = page.descendants ?? [];
    const hasDescendants = descendants.length > 0;
    const [isOpen, setIsOpen] = React.useState(true);
    const { sentinelRef, isSticking } = useIsSticking();

    const handleToggle = () => {
        if (!hasDescendants) {
            return;
        }

        setIsOpen((prev) => !prev);
    };

    return (
        <li className="page-group-item">
            <div ref={sentinelRef} className="h-0" aria-hidden="true" />
            <div
                className={cx(
                    'toc-group-header',
                    isSticking && 'toc-group-header-stuck',
                    isFirst && 'toc-group-header-first'
                )}
            >
                <button
                    type="button"
                    disabled={!hasDescendants}
                    aria-expanded={hasDescendants ? isOpen : undefined}
                    onClick={handleToggle}
                    className="toc-group"
                >
                    <TOCPageIcon page={page} />
                    <span className="min-w-0 flex-1">{page.title}</span>
                    {hasDescendants ? (
                        <span className="toc-group-chevron">
                            <ToggleChevron
                                open={isOpen}
                                orientation="right-to-down"
                                className="toc-chevron"
                            />
                        </span>
                    ) : null}
                </button>
            </div>
            {hasDescendants ? (
                <div className={cx('toc-group-body', !isOpen && 'toc-group-body-closed')}>
                    <div className="overflow-hidden">
                        <PagesList pages={descendants} />
                    </div>
                </div>
            ) : null}
        </li>
    );
}

/**
 * Detect when a sticky element becomes "stuck" using an IntersectionObserver on a sentinel.
 * Place the sentinel ref on a 0-height element right before the sticky element.
 */
function useIsSticking() {
    const sentinelRef = React.useRef<HTMLDivElement>(null);
    const [isSticking, setIsSticking] = React.useState(false);

    React.useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        // Find the closest scrollable ancestor to use as IntersectionObserver root
        let scrollParent: Element | null = sentinel.parentElement;
        while (scrollParent) {
            const { overflowY } = getComputedStyle(scrollParent);
            if (overflowY === 'auto' || overflowY === 'scroll') break;
            scrollParent = scrollParent.parentElement;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry) return;
                const rootTop = entry.rootBounds?.top ?? 0;
                setIsSticking(!entry.isIntersecting && entry.boundingClientRect.top < rootTop);
            },
            { root: scrollParent }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, []);

    return { sentinelRef, isSticking };
}
