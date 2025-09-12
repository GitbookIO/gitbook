import type { Transition } from 'motion/react';

// Slight bounce but minimal overshoot esp. at the minimized state.
const spring = {
    type: 'spring' as const,
    stiffness: 130,
    damping: 19,
    mass: 1,
};

const parent = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            delayChildren: 0.4,
            staggerChildren: 0.1,
        },
    },
};

const staggeringChild = {
    hidden: {
        opacity: 0,
        scale: 0.7,
    },
    show: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            type: 'spring',
        } as Transition,
    },
};

export const minifyButtonAnimation = {
    initial: {
        scale: 0.5,
        opacity: 0,
    },
    animate: {
        scale: 1,
        opacity: 1,
    },
    exit: {
        scale: 0.5,
        opacity: 0,
    },
};

export const getCopyVariants = (position: number) => {
    return {
        initial: {
            opacity: 0,
            x: -10,
        },
        animate: {
            opacity: 1,
            x: 0,
        },
        transition: {
            duration: 0.1,
            delay: position / 10 + 0.3,
        } as Transition,
    };
};

export const toolbarEasings = {
    spring,
    parent,
    staggeringChild,
};
