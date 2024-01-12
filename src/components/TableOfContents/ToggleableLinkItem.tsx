'use client';

import IconChevronRight from '@geist-ui/icons/chevronRight';
import { motion, stagger, useAnimate } from 'framer-motion';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import React from 'react';

import { tcls } from '@/lib/tailwind';

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

const staggerMenuItems = stagger(0.02, { ease: (p) => Math.pow(p, 2) });

/**
 * Client component for a page document to toggle its children and be marked as active.
 */
export function ToggleableLinkItem(props: {
    href: string;
    pathname: string;
    children: React.ReactNode;
    descendants: React.ReactNode;
}) {
    const { href, children, descendants, pathname } = props;

    const rawActiveSegment = useSelectedLayoutSegment() ?? '';
    const activeSegment = decodeURIComponent(rawActiveSegment);

    const isActive = activeSegment === pathname;
    const hasDescendants = !!descendants;
    const hasActiveDescendant =
        hasDescendants && (isActive || activeSegment.startsWith(pathname + '/'));

    const [scope, animate] = useAnimate();
    const [isVisible, setIsVisible] = React.useState(hasActiveDescendant);

    // Update the visibility of the children, if we are navigating to a descendant.
    React.useEffect(() => {
        if (!hasDescendants) {
            return;
        }

        setIsVisible((prev) => prev || hasActiveDescendant);
    }, [hasActiveDescendant, hasDescendants]);

    // Animate the visibility of the children
    // only after the initial state.
    React.useEffect(() => {
        if (!mountedRef.current || !hasDescendants) {
            return;
        }

        animate(scope.current, isVisible ? show : hide, {
            duration: 0.1,
        });

        if (isVisible)
            animate(
                '& > ul > li',
                { opacity: 1 },
                {
                    delay: staggerMenuItems,
                },
            );
        else {
            animate('& > ul > li', { opacity: 0 });
        }
    }, [isVisible, hasDescendants]);

    // Track if the component is mounted.
    const mountedRef = React.useRef(false);
    React.useEffect(() => {
        mountedRef.current = true;
    }, []);

    return (
        <div>
            <Link
                href={href}
                className={tcls(
                    'flex',
                    'flex-row',
                    'justify-between',
                    'pl-5',
                    'pr-1.5',
                    'py-1.5',
                    'text-sm',
                    'transition-colors',
                    'relative',
                    'text-balance',
                    'before:border-l',
                    'before:absolute',
                    'before:left-[-1px]',
                    'before:top-0',
                    'before:h-full',
                    'rounded-md',
                    '[&+div_a]:rounded-l-none',
                    isActive
                        ? [
                              'before:border-primary-500',
                              'font-semibold',
                              'text-primary',
                              'hover:bg-primary/3',
                              'dark:before:border-primary-400',
                              'dark:text-primary-400',
                              'hover:before:border-primary',
                              'dark:hover:bg-primary-500/3',
                              'dark:hover:before:border-primary',
                          ]
                        : [
                              'before:border-transparent',
                              'font-normal',
                              'text-dark/8',
                              'hover:bg-dark/1',
                              'hover:before:border-dark/3',
                              'dark:text-light/7',
                              'dark:hover:bg-light/2',
                              'dark:hover:before:border-light/3',
                          ],
                )}
            >
                {children}
                {hasDescendants ? (
                    <span
                        className={tcls(
                            'group',
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
                            setIsVisible((prev) => !prev);
                        }}
                    >
                        <IconChevronRight
                            className={tcls(
                                'grid',
                                'flex-shrink-0',
                                'w-5',
                                'h-5',
                                'p-0.5',
                                '[&>path]:transition-[stroke-opacity]',
                                'text-current',
                                'transition-transform',
                                '[&>path]:[stroke-opacity:0.40]',
                                'group-hover:[&>path]:[stroke-opacity:1]',

                                isVisible ? ['rotate-90'] : ['rotate-0'],
                            )}
                        />
                    </span>
                ) : null}
            </Link>
            {hasDescendants ? (
                <motion.div
                    ref={scope}
                    className={tcls(isVisible ? null : '[&_ul>li]:opacity-1')}
                    initial={isVisible ? show : hide}
                >
                    {descendants}
                </motion.div>
            ) : null}
        </div>
    );
}
