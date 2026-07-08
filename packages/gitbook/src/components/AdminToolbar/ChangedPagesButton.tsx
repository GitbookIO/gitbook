'use client';

import { tcls } from '@/lib/tailwind';
import { Icon, type IconName, IconStyle } from '@gitbook/icons';
import { motion, useReducedMotion } from 'motion/react';
import type { SVGProps } from 'react';
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '../primitives';
import type { ToolbarButtonProps } from './Toolbar';
import type { MinimalChangedPage, MinimalChangedPages } from './types';

const STATUS_ICON_STYLES: Record<
    MinimalChangedPage['status'],
    { chip: string; icon: IconName; iconClassName: string; iconStyle?: IconStyle }
> = {
    created: {
        chip: 'border-green-200 bg-green-50',
        icon: 'plus',
        iconClassName: 'size-3.5 text-green-600',
    },
    edited: {
        chip: 'border-blue-200 bg-blue-50',
        icon: 'pencil',
        iconClassName: 'size-3 text-blue-600',
        iconStyle: IconStyle.Regular,
    },
    moved: {
        chip: 'border-blue-200 bg-blue-50',
        icon: 'arrow-right',
        iconClassName: 'size-3 text-blue-600',
    },
    deleted: {
        chip: 'border-red-200 bg-red-50',
        icon: 'minus',
        iconClassName: 'size-3 text-red-600',
    },
};

const STATUS_ICON_CHIP_CLASS = 'flex size-5 shrink-0 items-center justify-center rounded-md border';

/**
 * A button that opens a popover with quick links to the _changed_ pages.
 */
export function ChangedPagesButton(props: {
    changedPages: MinimalChangedPages | null;
    motionValues?: ToolbarButtonProps['motionValues'];
}) {
    const { changedPages, motionValues } = props;
    const reduceMotion = useReducedMotion();

    if (!changedPages?.pages.length) {
        return null;
    }

    const changedPagesCount = changedPages.pages.length + changedPages.more;
    const changedPagesLabel = `${changedPagesCount} changed ${
        changedPagesCount === 1 ? 'page' : 'pages'
    }`;

    const trigger = (
        <button
            type="button"
            aria-label="View changed pages"
            className="relative size-8 cursor-pointer border-0 bg-transparent p-0"
        >
            <motion.span
                aria-hidden="true"
                style={
                    reduceMotion
                        ? undefined
                        : {
                              scale: motionValues?.scale,
                              x: motionValues?.x,
                              transformOrigin: 'bottom center',
                              zIndex: motionValues?.scale ? 10 : 'auto',
                          }
                }
                transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                }}
                className={tcls(
                    'toolbar-button',
                    'relative flex size-8 items-center justify-center gap-1 truncate rounded-full text-sm transition-colors',
                    'text-tint-7 hover:text-tint-1',
                    'dark:text-tint-12',
                    'bg-[var(--toolbar-bg)]',
                    'hover:bg-[color-mix(in_srgb,var(--toolbar-bg)_90%,white)]'
                )}
            >
                <DiffIcon className="size-4 shrink-0" />
            </motion.span>
        </button>
    );

    return (
        <DropdownMenu
            button={trigger}
            buttonTooltip="View changed pages"
            side="top"
            align="end"
            sideOffset={12}
            className="w-80 max-w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0"
        >
            <div className="px-3 py-2 font-medium text-sm text-tint">{changedPagesLabel}</div>
            <DropdownMenuSeparator className="m-0" />
            <div className="flex max-h-80 flex-col overflow-y-auto">
                {changedPages.pages.map((page) => (
                    <ChangedPageMenuItem key={page.id} page={page} />
                ))}
            </div>
            {changedPages.more > 0 ? (
                <>
                    <DropdownMenuSeparator />
                    <div className="px-3 py-1 text-tint-subtle text-xs">
                        {changedPages.more} more changes not shown
                    </div>
                </>
            ) : null}
        </DropdownMenu>
    );
}

function ChangedPageMenuItem(props: { page: MinimalChangedPage }) {
    const { page } = props;
    const actionLabel = page.action === 'editor' ? 'Open in editor' : 'Open';

    return (
        <DropdownMenuItem
            href={page.href}
            className="group/changed-page relative w-full min-w-0 items-center rounded-none px-3 py-1.5"
        >
            <span className="flex min-w-0 flex-1 items-center gap-2">
                <ChangedPageStatusIcon status={page.status} />
                <span className="min-w-0 flex-1 transition-[padding] group-hover/changed-page:pr-24 group-focus-visible/changed-page:pr-24 group-data-[highlighted]/changed-page:pr-24">
                    <span className="block truncate font-medium text-sm leading-4">
                        {page.title}
                    </span>
                    <span className="block truncate text-tint-subtle text-xs leading-4">
                        /{page.path || ''}
                    </span>
                </span>
                <span className="pointer-events-none absolute right-2 flex items-center gap-0.5 bg-tint-hover pl-3 text-tint-subtle text-xs opacity-0 transition-opacity group-hover/changed-page:opacity-100 group-focus-visible/changed-page:opacity-100 group-data-[highlighted]/changed-page:opacity-100">
                    {actionLabel}
                    <Icon icon="chevron-right" className="size-3 shrink-0" />
                </span>
            </span>
        </DropdownMenuItem>
    );
}

function ChangedPageStatusIcon(props: { status: MinimalChangedPage['status'] }) {
    const { status } = props;
    const style = STATUS_ICON_STYLES[status];

    return (
        <span className={tcls(STATUS_ICON_CHIP_CLASS, style.chip)}>
            <Icon icon={style.icon} iconStyle={style.iconStyle} className={style.iconClassName} />
        </span>
    );
}

function DiffIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg fill="none" viewBox="0 0 16 16" aria-hidden="true" {...props}>
            <path
                fill="currentColor"
                d="M8 2.4a.6.6 0 0 1 .6.6v2.9h2.9a.6.6 0 1 1 0 1.2H8.6V10a.6.6 0 1 1-1.2 0V7.1H4.5a.6.6 0 0 1 0-1.2h2.9V3a.6.6 0 0 1 .6-.6M4.5 12.4a.6.6 0 1 0 0 1.2h7a.6.6 0 1 0 0-1.2z"
            />
        </svg>
    );
}
