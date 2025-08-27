'use client';

import { type ClassValue, tcls } from '@/lib/tailwind';
import React from 'react';

export const AsideSectionHighlight = React.memo(
    ({
        className,
    }: {
        className?: ClassValue;
    }) => {
        return (
            <div
                className={tcls([
                    'border-primary-9',
                    'tint:border-primary-11',
                    'sidebar-list-line:border-l-2',

                    'inset-0',
                    'pointer-events-none',
                    'absolute',
                    'z-0',
                    'sidebar-list-line:-left-px',

                    'rounded-md',
                    'straight-corners:rounded-none',
                    'circular-corners:rounded-2xl',
                    'sidebar-list-line:rounded-l-none!',

                    'sidebar-list-pill:bg-primary',
                    '[html.theme-muted.sidebar-list-pill_&]:bg-primary-hover',
                    '[html.theme-gradient.sidebar-list-pill_&]:bg-primary-active',

                    'contrast-more:border',
                    'contrast-more:bg-primary',
                    className,
                ])}
            />
        );
    }
);
