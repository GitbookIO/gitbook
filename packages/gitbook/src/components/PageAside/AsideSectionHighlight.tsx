'use client';

import { Transition, motion, useReducedMotion } from 'framer-motion';
import React from 'react';

import { ClassValue, tcls } from '@/lib/tailwind';

export function AsideSectionHighlight({
    transition,
    className,
}: {
    transition?: Transition;
    className?: ClassValue;
}) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            layout
            layoutId="sections-line"
            className={tcls([
                'border-tint',
                'sidebar-list-line:border-l-2',

                'dark:border-tint-400',
                'inset-0',
                'pointer-events-none',
                'absolute',
                'z-0',
                'sidebar-list-line:-left-px',

                'rounded-md',
                'straight-corners:rounded-none',
                'sidebar-list-line:rounded-l-none',

                'sidebar-list-pill:bg-tint/3',
                'dark:sidebar-list-pill:bg-tint-400/3',

                'contrast-more:border',
                'contrast-more:bg-tint/3',
                'dark:contrast-more:bg-tint-400/3',
                className,
            ])}
            transition={prefersReducedMotion ? { duration: 0 } : transition}
        />
    );
}
