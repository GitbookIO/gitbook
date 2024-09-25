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
                'text-light',
                'dark:text-light',
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
                'hover:bg-dark-1',
                'hover:text-white',
                'truncate',
                'text-light',
                'dark:text-light',
                'dark:hover:bg-dark-2',
                'hover:shadow-lg',
                'cursor-pointer',
            )}
        >
            {children}
        </a>
    );
}
