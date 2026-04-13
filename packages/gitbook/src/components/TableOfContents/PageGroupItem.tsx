'use client';

import { AnimatePresence, motion } from 'motion/react';
import React from 'react';
import type { ClientTOCPageGroup } from './encodeClientTableOfContents';

import { tcls } from '@/lib/tailwind';
import { ToggleChevron } from '../primitives';

import { PagesList } from './PagesList';
import { TOCPageIcon } from './TOCPageIcon';
import { ToggleableLinkItemStyles } from './styles';

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
                    '-top-4 sticky z-1',
                    'mt-1 pt-2.5 pb-0',
                    'bg-tint-base',
                    'sidebar-filled:bg-tint-subtle',
                    'theme-muted:bg-tint-subtle',
                    '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-subtle',
                    '[html.sidebar-filled.theme-muted_&]:bg-tint-base',
                    '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-base',
                    'lg:[html.sidebar-default.theme-gradient_&]:bg-gradient-primary',
                    'lg:[html.sidebar-default.theme-gradient.tint_&]:bg-gradient-tint',
                    isFirst ? '-mt-2 -top-2 circular-corners:rounded-t-2xl rounded-t-md pt-2' : ''
                )}
            >
                <button
                    type="button"
                    disabled={!hasDescendants}
                    aria-expanded={hasDescendants ? isOpen : undefined}
                    onClick={handleToggle}
                    className={tcls(
                        ToggleableLinkItemStyles,
                        'toc-group min-h-8 w-full border-0 text-left',
                        'font-semibold text-xs uppercase tracking-wide',
                        'appearance-none text-tint-strong',
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
                <AnimatePresence initial={false}>
                    {isOpen ? (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-px flex flex-col overflow-hidden"
                        >
                            <PagesList pages={descendants} />
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            ) : null}
        </li>
    );
}
