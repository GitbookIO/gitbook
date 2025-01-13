'use client';

import { Icon } from '@gitbook/icons';
import { motion, stagger, useAnimate } from 'framer-motion';
import { useSelectedLayoutSegment } from 'next/navigation';
import React from 'react';

import { ClassValue, tcls } from '@/lib/tailwind';

import { useScrollToActiveTOCItem } from './TOCScroller';
import { useIsMounted } from '../hooks';
import { Link, LinkInsightsProps } from '../primitives';

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
export function ToggleableLinkItem(
    props: {
        href: string;
        pathname: string;
        children: React.ReactNode;
        descendants: React.ReactNode;
    } & LinkInsightsProps,
) {
    const { href, children, descendants, pathname, insights } = props;

    const rawActiveSegment = useSelectedLayoutSegment() ?? '';
    const activeSegment = decodeURIComponent(rawActiveSegment);

    const isActive = activeSegment === pathname;
    const hasDescendants = !!descendants;
    const hasActiveDescendant =
        hasDescendants && (isActive || activeSegment.startsWith(pathname + '/'));

    const [scope, animate] = useAnimate();
    const [isVisible, setIsVisible] = React.useState(hasActiveDescendant);
    const isMounted = useIsMounted();

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
        if (!isMounted || !hasDescendants) {
            return;
        }
        try {
            animate(scope.current, isVisible ? show : hide, {
                duration: 0.1,
            });

            const selector = '& > ul > li';
            if (isVisible)
                animate(
                    selector,
                    { opacity: 1 },
                    {
                        delay: staggerMenuItems,
                    },
                );
            else {
                animate(selector, { opacity: 0 });
            }
        } catch (error) {
            // The selector can crash in some browsers, we ignore it as the animation is not critical.
            console.error(error);
        }
    }, [isVisible, isMounted, hasDescendants, animate, scope]);

    const linkRef = React.createRef<HTMLAnchorElement>();
    useScrollToActiveTOCItem({ linkRef, isActive });

    return (
        <>
            <Link
                ref={linkRef}
                href={href}
                insights={insights}
                {...(isActive ? { 'aria-current': 'page' } : {})}
                className={tcls(
                    'group/toclink',
                    'relative',
                    'transition-colors',

                    'flex',
                    'flex-row',
                    'justify-between',

                    'p-1.5',
                    'pl-3',
                    'rounded-md',
                    'straight-corners:rounded-none',

                    'text-sm',
                    'font-normal',
                    'text-balance',
                    'text-dark/8',
                    'hover:text-dark/9',
                    'hover:bg-dark/1',
                    'hover:before:bg-dark/3',
                    'dark:text-light/8',
                    'dark:hover:text-light/9',
                    'dark:hover:bg-light/1',
                    'dark:hover:before:bg-light/3',
                    'contrast-more:text-dark',
                    'contrast-more:dark:text-light',

                    'hover:contrast-more:text-dark',
                    'dark:hover:contrast-more:text-light',
                    'hover:contrast-more:ring-1',
                    'hover:contrast-more:ring-dark',
                    'dark:contrast-more:hover:ring-light',

                    'before:contents[]',
                    'before:absolute',
                    'before:inset-y-0',
                    'before:-left-px',

                    '[&+div_a]:pl-5',
                    'sidebar-list-line:before:w-px',
                    'sidebar-list-default:[&+div_a]:before:w-px',
                    'sidebar-list-default:[&+div_a]:rounded-l-none',
                    'sidebar-list-line:rounded-l-none',

                    isActive && [
                        'font-semibold',
                        'sidebar-list-line:before:w-0.5',

                        'before:bg-tint',
                        'text-tint',
                        'sidebar-list-pill:bg-tint/3',
                        'sidebar-list-pill:text-tint',

                        'hover:bg-tint/3',
                        'hover:text-tint',
                        'hover:before:bg-tint',
                        'sidebar-list-pill:hover:bg-tint/4',

                        'contrast-more:text-tint',
                        'contrast-more:hover:text-tint',
                        'dark:contrast-more:text-tint-400',
                        'dark:contrast-more:hover:text-tint-400',
                        'contrast-more:bg-tint/3',
                        'dark:contrast-more:bg-tint-400/3',
                        'contrast-more:ring-1',
                        'contrast-more:ring-tint',
                        'contrast-more:hover:ring-tint',
                        'dark:contrast-more:ring-tint-400',
                        'dark:contrast-more:hover:ring-tint-400',

                        'dark:before:bg-tint-400',
                        'dark:text-tint-400',
                        'dark:sidebar-list-pill:bg-tint-400/3',
                        'dark:sidebar-list-pill:text-tint-400',

                        'dark:hover:bg-tint-400/3',
                        'dark:hover:text-tint-400',
                        'dark:hover:before:bg-tint-400',
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
                            'straight-corners:rounded-sm',
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
                            isActive ? ['hover:bg-tint/4', 'dark:hover:bg-tint/4'] : [],
                        )}
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setIsVisible((prev) => !prev);
                        }}
                    >
                        <Icon
                            icon="chevron-right"
                            className={tcls(
                                'grid',
                                'flex-shrink-0',
                                'size-3',
                                'm-1',
                                'transition-[opacity]',
                                'text-current',
                                'transition-transform',
                                'opacity-6',
                                'group-hover:opacity-11',
                                'contrast-more:opacity-11',

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
        </>
    );
}
