'use client';

import type { SiteSection, SiteSectionGroup } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';
import { motion, stagger, useAnimate } from 'framer-motion';
import React from 'react';

import { SectionsList } from '@/lib/api';
import { ClassValue, tcls } from '@/lib/tailwind';

import { Link } from '../primitives';
import { SectionIcon } from './SectionIcon';
import { useIsMounted } from '../hooks';
import { TOCScrollContainer, useScrollToActiveTOCItem } from '../TableOfContents/TOCScroller';

const MAX_ITEMS = 5; // If there are more sections than this, they'll be shown below the fold in a scrollview.

/**
 * A list of items representing site sections for multi-section sites
 */
export function SiteSectionList(props: { sections: SectionsList; className: ClassValue }) {
    const {
        sections: { list: sectionsAndGroups, section: currentSection },
        className,
    } = props;

    return (
        sectionsAndGroups.length > 0 && (
            <nav
                aria-label="Sections"
                className={tcls(
                    `text-tint text-sm
                    border-b border-tint-subtle -mx-5 relative
                    before:absolute before:contents[] before:left-0 before:right-2 before:bottom-0 before:h-12 before:pointer-events-none 
                    before:bg-gradient-to-b from-transparent to-tint-base sidebar-filled:to-tint-subtle [html.tint.sidebar-filled_&]:to-tint-base`,
                    className,
                )}
            >
                <TOCScrollContainer
                    style={{ maxHeight: `${MAX_ITEMS * 3 + 2}rem` }}
                    className="overflow-y-auto px-2 pb-6 gutter-stable"
                >
                    {sectionsAndGroups.map((item) => {
                        if (item.object === 'site-section-group') {
                            return (
                                <SiteSectionGroupItem
                                    key={item.id}
                                    group={item}
                                    currentSection={currentSection}
                                />
                            );
                        }

                        return (
                            <SiteSectionListItem
                                section={item}
                                isActive={item.id === currentSection.id}
                                key={item.id}
                            />
                        );
                    })}
                </TOCScrollContainer>
            </nav>
        )
    );
}

export function SiteSectionListItem(props: { section: SiteSection; isActive: boolean; className?: string; }) {
    const { section, isActive, className, ...otherProps } = props;

    const isMounted = useIsMounted();
    React.useEffect(() => {}, [isMounted]); // This updates the useScrollToActiveTOCItem hook once we're mounted, so we can actually scroll to the this item

    const linkRef = React.createRef<HTMLAnchorElement>();
    useScrollToActiveTOCItem({ linkRef, isActive });

    return (
        <Link
            href={section.urls.published ?? ''}
            ref={linkRef}
            aria-current={isActive && 'page'}
            className={tcls(
                tcls(`flex flex-row items-center gap-3 px-3 py-2
            hover:bg-tint-hover contrast-more:hover:ring-1 contrast-more:hover:ring-tint
            hover:text-tint-strong
            rounded-md straight-corners:rounded-none transition-all group/section-link`,
                isActive
                    ? `text-primary hover:text-primary-strong contrast-more:text-primary-strong font-semibold
                hover:bg-primary-hover contrast-more:hover:ring-1 contrast-more:hover:ring-primary-hover`
                    : null,
            ), className)}
            {...otherProps}
        >
            <div
                className={tcls(
                    `shrink-0 size-8 flex items-center justify-center
                    bg-tint-subtle shadow-sm shadow-tint
                    dark:shadow-none rounded-md straight-corners:rounded-none leading-none
                    ring-1 ring-tint-subtle
                    text-tint contrast-more:text-tint-strong
                    group-hover/section-link:scale-110 group-active/section-link:scale-90 group-active/section-link:shadow-none group-hover/section-link:ring-tint-hover
                    transition-transform text-lg`,
                    isActive
                        ? `bg-primary ring-primary group-hover/section-link:ring-primary-hover,
                        shadow-md shadow-primary
                        contrast-more:ring-2 contrast-more:ring-primary
                        text-primary contrast-more:text-primary-strong tint:bg-primary-solid tint:text-contrast-primary-solid`
                        : null,
                )}
            >
                {section.icon ? (
                    <SectionIcon icon={section.icon as IconName} isActive={isActive} />
                ) : (
                    <span className={`opacity-8 text-sm ${isActive && 'opacity-10'}`}>
                        {section.title.substring(0, 2)}
                    </span>
                )}
            </div>
            {section.title}
        </Link>
    );
}

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

export function SiteSectionGroupItem(props: {
    group: SiteSectionGroup;
    currentSection: SiteSection;
}) {
    const { group, currentSection } = props;
    const [scope, animate] = useAnimate();
    const hasDescendants = group.sections.length > 0;
    const isActiveGroup = group.sections.some((section) => section.id === currentSection.id);
    const [isVisible, setIsVisible] = React.useState(isActiveGroup);

    const isMounted = useIsMounted();

    // Update the visibility of the children, if we are navigating to a descendant.
    React.useEffect(() => {
        if (!hasDescendants) {
            return;
        }

        setIsVisible((prev) => prev || isActiveGroup);
    }, [isActiveGroup, hasDescendants]);

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

    return (
        <>
            <button
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setIsVisible((prev) => !prev);
                }}
                className={`w-full flex flex-row items-center gap-3 px-3 py-2
            hover:bg-dark/1 contrast-more:hover:ring-1 contrast-more:hover:ring-dark dark:hover:bg-light/1 contrast-more:dark:hover:ring-light
            hover:text-dark/9 dark:hover:text-light/9
            rounded-md straight-corners:rounded-none transition-all group/section-link 
            ${
                isActiveGroup
                    ? `text-primary hover:text-primary contrast-more:text-primary-700 contrast-more:hover:text-primary-700 contrast-more:font-semibold
                dark:text-primary-400 dark:hover:text-primary-400 dark:contrast-more:text-primary-300 dark:contrast-more:hover:text-primary-300 
                hover:bg-primary/3 contrast-more:hover:ring-1 contrast-more:hover:ring-primary-700 dark:hover:bg-primary-400/3 contrast-more:dark:hover:ring-primary-300`
                    : null
            }`}
            >
                            <div
                className={`shrink-0 size-8 flex items-center justify-center
                    bg-light-1 dark:bg-dark-1 shadow-sm shadow-dark/4
                    dark:shadow-none rounded-md straight-corners:rounded-none leading-none
                    ring-1 ring-dark/1 dark:ring-light/2
                    text-dark/6 contrast-more:text-dark dark:text-light/6 contrast-more:dark:text-light
                    group-hover/section-link:scale-110 group-active/section-link:scale-90 group-active/section-link:shadow-none
                    transition-transform text-lg
                    ${
                        isActiveGroup
                            ? `bg-primary-50 dark:bg-primary-900
                        ring-primary-600/6 dark:ring-primary-400/6
                        shadow-md shadow-primary-600/4
                        contrast-more:ring-2 contrast-more:ring-primary-700 contrast-more:dark:ring-primary-300
                        text-primary-600 contrast-more:text-primary-700 dark:text-primary-400 dark:contrast-more:text-primary-300`
                            : null
                    }`}
            >
                {group.icon ? (
                    <SectionIcon icon={group.icon as IconName} isActive={isActiveGroup} />
                ) : (
                    <span className={`opacity-8 text-sm ${isActiveGroup && 'opacity-10'}`}>
                        {group.title.substring(0, 2)}
                    </span>
                )}
            </div>
                {group.title}
                <span
                    className={tcls(
                        'ml-auto',
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
                        isActiveGroup ? ['hover:bg-tint/4', 'dark:hover:bg-tint/4'] : [],
                    )}
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
            </button>
            {hasDescendants ? (
                <motion.div
                    ref={scope}
                    className={tcls(isVisible ? null : '[&_ul>li]:opacity-1')}
                    initial={isVisible ? show : hide}
                >
                    {group.sections.map((section) => (
                        <SiteSectionListItem
                            section={section}
                            isActive={section.id === currentSection.id}
                            key={section.id}
                            className="pl-5"
                        />
                    ))}
                </motion.div>
            ) : null}
        </>
    );
}
