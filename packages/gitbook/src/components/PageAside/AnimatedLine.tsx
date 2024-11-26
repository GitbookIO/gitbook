'use client';

import { Transition, motion, useReducedMotion } from 'framer-motion';
import React from 'react';

import { tcls } from '@/lib/tailwind';

export function AnimatedLine({ transition }: { transition?: Transition }) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            layout
            layoutId="sections-line"
            className={tcls([
                'border-primary',
                'border-l',
                'dark:border-primary-400',
                'h-full',
                'absolute',
                'z-20',
                '-left-[5px]',
            ])}
            transition={prefersReducedMotion ? { duration: 0 } : transition}
        />
    );
}
