'use client';

import type { SiteSection, SiteSectionGroup } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';
import { motion } from 'framer-motion';
import React from 'react';

import type { SectionsList } from '@/lib/api';
import { type ClassValue, tcls } from '@/lib/tailwind';

import { TOCScrollContainer, useScrollToActiveTOCItem } from '../TableOfContents/TOCScroller';
import { useIsMounted, useToggleAnimation } from '../hooks';
import { Link } from '../primitives';
import { SectionIcon } from './SectionIcon';

const MAX_ITEMS = 5; // If there are more sections than this, they'll be shown below the fold in a scrollview.

/**
 * A list of items representing site sections for multi-section sites
 */
export function SiteSectionList(props: { sections: SectionsList; className: ClassValue }) {
    const {
        sections: { list: sectionsAndGroups, current: currentSection },
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
                    before:bg-gradient-to-b from-transparent to-tint-base sidebar-filled:to-tint-subtle theme-muted:to-tint-subtle theme-bold-tint:to-tint-subtle [html.sidebar-filled.theme-muted_&]:to-tint-base [html.sidebar-filled.theme-bold.tint_&]:to-tint-base`,
                    className
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

export function SiteSectionListItem(props: {
    section: SiteSection;
    isActive: boolean;
    className?: string;
}) {
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
                `flex flex-row items-center gap-3 px-3 py-2
            hover:bg-tint-hover contrast-more:hover:ring-1 contrast-more:hover:ring-tint
            hover:text-tint-strong
            rounded-md straight-corners:rounded-none transition-all group/section-link`,
                isActive
                    ? `text-primary-subtle hover:text-primary contrast-more:text-primary contrast-more:hover:text-primary-strong font-semibold
                hover:bg-primary-hover contrast-more:hover:ring-1 contrast-more:hover:ring-primary-hover`
                    : null,
                className
            )}
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
                        text-primary-subtle contrast-more:text-primary tint:bg-primary-solid tint:text-contrast-primary-solid`
                        : null
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

export function SiteSectionGroupItem(props: {
    group: SiteSectionGroup;
    currentSection: SiteSection;
}) {
    const { group, currentSection } = props;

    const hasDescendants = group.sections.length > 0;
    const isActiveGroup = group.sections.some((section) => section.id === currentSection.id);
    const [isVisible, setIsVisible] = React.useState(isActiveGroup);

    // Update the visibility of the children, if we are navigating to a descendant.
    React.useEffect(() => {
        if (!hasDescendants) {
            return;
        }

        setIsVisible((prev) => prev || isActiveGroup);
    }, [isActiveGroup, hasDescendants]);

    const { show, hide, scope } = useToggleAnimation({ hasDescendants, isVisible });

    return (
        <>
            <button
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setIsVisible((prev) => !prev);
                }}
                className={`w-full flex flex-row items-center gap-3 px-3 py-2
            hover:bg-tint-hover contrast-more:hover:ring-1 contrast-more:hover:ring-tint
            hover:text-tint-strong
            rounded-md straight-corners:rounded-none transition-all group/section-link 
            ${
                isActiveGroup
                    ? `text-primary hover:text-primary-strong contrast-more:text-primary-strong font-semibold
                hover:bg-primary-hover contrast-more:hover:ring-1 contrast-more:hover:ring-primary-hover`
                    : null
            }`}
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
                        isActiveGroup
                            ? `bg-primary ring-primary group-hover/section-link:ring-primary-hover,
                        shadow-md shadow-primary
                        contrast-more:ring-2 contrast-more:ring-primary
                        text-primary contrast-more:text-primary-strong tint:bg-primary-solid tint:text-contrast-primary-solid`
                            : null
                    )}
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
                        'hover:bg-tint-active',
                        'hover:text-current',
                        isActiveGroup ? ['hover:bg-tint-hover'] : []
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

                            isVisible ? ['rotate-90'] : ['rotate-0']
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
