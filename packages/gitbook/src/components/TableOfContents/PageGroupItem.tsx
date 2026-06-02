'use client';

import React from 'react';
import type { ClientTOCPageGroup } from './encodeClientTableOfContents';

import { tcls } from '@/lib/tailwind';
import { ToggleChevron } from '../primitives';

import { PagesList } from './PagesList';
import { TOCPageIcon } from './TOCPageIcon';
import { ToCButtonItemStyles } from './styles';

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
        <li className="page-group-item flex flex-col">
            <div ref={sentinelRef} className="h-0" aria-hidden="true" />
            <div
                className={tcls(
                    '-top-4 sticky z-1 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-4 after:bg-linear-to-b after:from-tint-base after:to-transparent after:transition-opacity',
                    isSticking ? '' : 'after:opacity-0',
                    'mt-1 pt-2.5 pb-0',
                    'bg-tint-base',
                    'sidebar-filled:after:from-tint-subtle',
                    'sidebar-filled:bg-tint-subtle',
                    'theme-muted:after:from-tint-subtle',
                    'theme-muted:bg-tint-subtle',
                    '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-subtle',
                    '[html.sidebar-filled.theme-bold.tint_&]:after:from-tint-subtle',
                    '[html.sidebar-filled.theme-muted_&]:bg-tint-base',
                    '[html.sidebar-filled.theme-muted_&]:after:from-tint-base',
                    '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-base',
                    '[html.sidebar-filled.theme-bold.tint_&]:after:from-tint-base',
                    'lg:[html.sidebar-default.theme-gradient_&]:bg-gradient-primary',
                    'lg:[html.sidebar-default.theme-gradient_&]:after:from-primary-2',
                    'lg:[html.sidebar-default.theme-gradient.tint_&]:bg-gradient-tint',
                    'lg:[html.sidebar-default.theme-gradient.tint_&]:after:from-tint-subtle',
                    isFirst ? '-mt-2 -top-2 circular-corners:rounded-t-2xl rounded-t-md pt-2' : ''
                )}
            >
                <button
                    type="button"
                    disabled={!hasDescendants}
                    aria-expanded={hasDescendants ? isOpen : undefined}
                    onClick={handleToggle}
                    className={tcls(
                        ToCButtonItemStyles,
                        'toc-group min-h-8 w-full border-0 text-left',
                        'font-semibold text-xs uppercase tracking-wide',
                        'appearance-none',
                        '[&_.toc-group-chevron]:transition-opacity',
                        'hover:[&_.toc-group-chevron]:opacity-11',
                        'focus-visible:[&_.toc-group-chevron]:opacity-11',
                        hasDescendants ? 'cursor-pointer' : ''
                    )}
                >
                    <TOCPageIcon page={page} />
                    <span className="min-w-0 flex-1">{page.title}</span>
                    {hasDescendants ? (
                        <span
                            className={tcls(
                                'toc-group-chevron ml-auto flex shrink-0 transition-opacity duration-150',
                                isOpen
                                    ? 'pointer-events-none opacity-0 delay-75'
                                    : 'opacity-6 delay-0'
                            )}
                        >
                            <ToggleChevron
                                open={isOpen}
                                orientation="right-to-down"
                                className="m-0! size-3!"
                            />
                        </span>
                    ) : null}
                </button>
            </div>
            {hasDescendants ? (
                <div
                    className={tcls(
                        'mt-px grid transition-[grid-template-rows,opacity] duration-200 ease-in-out',
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    )}
                >
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
                if (entry) {
                    setIsSticking(!entry.isIntersecting);
                }
            },
            { root: scrollParent }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, []);

    return { sentinelRef, isSticking };
}
