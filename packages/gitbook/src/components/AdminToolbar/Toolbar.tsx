'use client';

import * as React from 'react';

import { tcls } from '@/lib/tailwind';

export function Toolbar(props: { children: React.ReactNode }) {
    const { children } = props;

    return (
        <div
            className={tcls(
                'flex',
                'flex-row',
                'items-center',
                'gap-4',
                'text-sm',
                'px-4',
                'py-1',
                'rounded-full',
                'truncate',
                'text-gray-1',
                'dark:text-gray-12',
            )}
        >
            {children}
        </div>
    );
}

export function ToolbarBody(props: { children: React.ReactNode }) {
    return <div className="flex flex-col gap-1">{props.children}</div>;
}

export function ToolbarButtonGroups(props: { children: React.ReactNode }) {
    return <div className="flex flex-row gap-2">{props.children}</div>;
}

export function ToolbarButton(props: React.HTMLProps<HTMLAnchorElement>) {
    const { children, ...rest } = props;
    return (
        <a
            {...rest}
            className={tcls(
                'flex',
                'flex-col',
                'items-center',
                'justify-center',
                'size-11',
                'gap-1',
                'text-sm',
                'rounded-full',
                'truncate',
                'text-gray-1', // Equal to text-gray-strong in dark mode
                'dark:text-gray-12', // Equal to text-gray-strong in dark mode
                'hover:bg-gray-12',
                'dark:hover:bg-gray-1',
                'hover:shadow-lg',
                'cursor-pointer',
            )}
        >
            {children}
        </a>
    );
}
