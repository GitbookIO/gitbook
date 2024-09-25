'use client';

import { Transition, motion, useReducedMotion } from 'framer-motion';
import React from 'react';

export function AnimatedBackground({ transition }: { transition?: Transition }) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            layout
            layoutId="sections-item"
            className="absolute left-0 top-0 z-0 h-full w-full bg-primary-50 dark:bg-dark-3"
            transition={prefersReducedMotion ? { duration: 0 } : transition}
        />
    );
}
