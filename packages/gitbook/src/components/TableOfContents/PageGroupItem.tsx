'use client';

import React from 'react';

import { ToggleChevron } from '../primitives';
import type { ClientTOCPageGroup } from './encodeClientTableOfContents';
import { PagesList } from './PagesList';
import { ToCButtonItemStyles } from './styles';
import { TOCPageIcon } from './TOCPageIcon';
import { tcls } from '@/lib/tailwind';

export function PageGroupItem(props: { page: ClientTOCPageGroup; isFirst?: boolean }) {
    const { page, isFirst } = props;
    const descendants = page.descendants ?? [];
    const hasDescendants = descendants.length > 0;
    const [isOpen, setIsOpen] = React.useState(true);

    const handleToggle = () => {
        if (!hasDescendants) {
            return;
        }

        setIsOpen((prev) => !prev);
    };

    return (
        <li className="page-group-item flex flex-col">
            <div
                className={tcls(
                    // Pinned below the sidebar's 16px top fade (ScrollContainer's `mask-t-from-*`),
                    // so a stuck header is never rendered inside the band that fades it out.
                    'top-4 sticky z-1',
                    // Spacing lives in the margin, not padding, to keep the pinned box the size of
                    // the button: padding would push the title further down the sidebar when stuck.
                    'mt-3.5',
                    'bg-tint-base',
                    'sidebar-filled:bg-tint-subtle',
                    'theme-muted:bg-tint-subtle',
                    '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-subtle',
                    '[html.sidebar-filled.theme-muted_&]:bg-tint-base',
                    '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-base',
                    'lg:[html.sidebar-default.theme-gradient_&]:bg-gradient-primary',
                    'lg:[html.sidebar-default.theme-gradient.tint_&]:bg-gradient-tint',
                    // The first group rests exactly on its sticky offset, so it never shifts on scroll.
                    isFirst ? 'mt-0 circular-corners:rounded-t-2xl rounded-t-md' : ''
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
                        'font-heading font-semibold text-xs uppercase tracking-wide',
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
