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
                    'text-gray',
                    'hover:text-gray-strong',
                    'hover:bg-gray-12/1',
                    'hover:before:bg-gray',
                    'contrast-more:text-gray-strong',

                    'hover:contrast-more:text-gray-strong',
                    'hover:contrast-more:ring-1',
                    'hover:contrast-more:ring-gray-12',

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

                        'before:bg-tint-solid',
                        'text-tint',
                        'sidebar-list-pill:bg-tint-solid/3',
                        'sidebar-list-pill:text-tint',

                        'hover:bg-tint-solid-hover/3',
                        'hover:text-tint',
                        'hover:before:bg-tint-solid-hover',
                        'sidebar-list-pill:hover:bg-tint-solid-hover/4',

                        'contrast-more:text-tint-strong',
                        'contrast-more:hover:text-tint-strong',
                        'contrast-more:bg-tint',
                        'contrast-more:ring-1',
                        'contrast-more:ring-tint',
                        'contrast-more:hover:ring-tint',
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
                            'hover:bg-gray-active',
                            'hover:text-current',
                            isActive ? ['hover:bg-tint-hover'] : [],
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
