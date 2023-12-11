'use client';

import IconChevronRight from '@geist-ui/icons/chevronRight';
import { motion, stagger, useAnimate } from 'framer-motion';
import Link, { LinkProps } from 'next/link';
import React, { useState } from 'react';

import { tcls } from '@/lib/tailwind';

/**
 * Client component to allow toggling of a page's children.
 */

const show = {
    opacity: 1,
    height: 'auto',
    display: 'block',
};

const hide = {
    opacity: 0,
    height: 0,
    transitionEnd: {
        display: 'none',
    },
};

export function ToggleableLinkItem(
    props: LinkProps & {
        className?: string;
        children: React.ReactNode;
        descendants?: React.ReactNode;
        defaultOpen?: boolean;
        isActive?: boolean;
    },
) {
    const { children, descendants, defaultOpen = false, isActive = false, ...linkProps } = props;
    const staggerMenuItems = stagger(0.02, { ease: (p) => Math.pow(p, 2) });

    const [scope, animate] = useAnimate();
    const [isVisible, setIsVisible] = useState(defaultOpen);

    const toggleVisibility = () => {
        const willBecomeVisible = !isVisible;
        setIsVisible(willBecomeVisible);

        animate(scope.current, willBecomeVisible ? show : hide, {
            duration: 0.1,
        });

        if (willBecomeVisible)
            animate(
                '& > ul > li',
                { opacity: 1 },
                {
                    delay: staggerMenuItems,
                },
            );
        else animate('& > ul > li', { opacity: 0 });
    };

    return (
        <div>
            <Link {...linkProps}>
                {children}
                <span
                    className={tcls(
                        'relative',
                        'rounded-full',
                        'w-5',
                        'h-5',
                        'after:grid-area-1-1',
                        'after:absolute',
                        'after:-top-1',
                        'after:grid',
                        'after:-left-1',
                        'after:w-7',
                        'after:h-7',
                        'hover:bg-dark/2',
                        'hover:text-current',
                        'dark:hover:bg-light/2',
                        'dark:hover:text-current',
                        isActive ? ['hover:bg-primary/4', 'dark:hover:bg-primary/4'] : [],
                    )}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleVisibility();
                    }}
                >
                    <IconChevronRight
                        className={tcls(
                            'grid',
                            'flex-shrink-0',
                            'w-5',
                            'h-5',
                            'p-0.5',
                            'text-current',
                            'transition-transform',
                            isVisible ? ['rotate-90'] : ['rotate-0'],
                        )}
                    />
                </span>
            </Link>
            {/*  TODO: fix recursive issue */}
            <motion.div
                ref={scope}
                className={tcls(isVisible ? null : '[&_ul>li]:opacity-1')}
                initial={isVisible ? show : hide}
            >
                {descendants}
            </motion.div>
        </div>
    );
}
