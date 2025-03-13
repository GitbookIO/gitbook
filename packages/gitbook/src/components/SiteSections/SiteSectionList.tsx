'use client';

import { Icon, type IconName } from '@gitbook/icons';
import { motion } from 'framer-motion';
import React from 'react';

import { type ClassValue, tcls } from '@/lib/tailwind';

import { TOCScrollContainer, useScrollToActiveTOCItem } from '../TableOfContents/TOCScroller';
import { useIsMounted, useToggleAnimation } from '../hooks';
import { Link } from '../primitives';
import { SectionIcon } from './SectionIcon';
import type {
    ClientSiteSection,
    ClientSiteSectionGroup,
    ClientSiteSections,
} from './encodeClientSiteSections';

const MAX_ITEMS = 5; // If there are more sections than this, they'll be shown below the fold in a scrollview.

/**
 * A list of items representing site sections for multi-section sites
 */
export function SiteSectionList(props: { sections: ClientSiteSections; className: ClassValue }) {
    const {
        sections: { list: sectionsAndGroups, current: currentSection },
        className,
    } = props;

    return (
        sectionsAndGroups.length > 0 && (
            <nav
                aria-label="Sections"
                className={tcls(
                    '-mx-5 before:contents[] relative border-tint-subtle border-b from-transparent sidebar-filled:to-tint-subtle theme-bold-tint:to-tint-subtle theme-muted:to-tint-subtle to-tint-base text-sm text-tint before:pointer-events-none before:absolute before:right-2 before:bottom-0 before:left-0 before:h-12 before:bg-gradient-to-b [html.sidebar-filled.theme-bold.tint_&]:to-tint-base [html.sidebar-filled.theme-muted_&]:to-tint-base',
                    className
                )}
            >
                <TOCScrollContainer
                    style={{ maxHeight: `${MAX_ITEMS * 3 + 2}rem` }}
                    className="gutter-stable overflow-y-auto px-2 pb-6"
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
    section: ClientSiteSection;
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
            href={section.url}
            ref={linkRef}
            aria-current={isActive && 'page'}
            className={tcls(
                'group/section-link flex flex-row items-center gap-3 rounded-md straight-corners:rounded-none px-3 py-2 transition-all hover:bg-tint-hover hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint',
                isActive
                    ? 'font-semibold text-primary-subtle hover:bg-primary-hover hover:text-primary contrast-more:text-primary contrast-more:hover:text-primary-strong contrast-more:hover:ring-1 contrast-more:hover:ring-primary-hover'
                    : null,
                className
            )}
            {...otherProps}
        >
            <div
                className={tcls(
                    'flex size-8 shrink-0 items-center justify-center rounded-md straight-corners:rounded-none bg-tint-subtle text-lg text-tint leading-none shadow-sm shadow-tint ring-1 ring-tint-subtle transition-transform group-hover/section-link:scale-110 group-hover/section-link:ring-tint-hover group-active/section-link:scale-90 group-active/section-link:shadow-none contrast-more:text-tint-strong dark:shadow-none',
                    isActive
                        ? 'bg-primary tint:bg-primary-solid text-primary-subtle tint:text-contrast-primary-solid shadow-md shadow-primary ring-primary group-hover/section-link:ring-primary-hover, contrast-more:text-primary contrast-more:ring-2 contrast-more:ring-primary'
                        : null
                )}
            >
                {section.icon ? (
                    <SectionIcon icon={section.icon as IconName} isActive={isActive} />
                ) : (
                    <span className={`text-sm opacity-8 ${isActive && 'opacity-10'}`}>
                        {section.title.substring(0, 2)}
                    </span>
                )}
            </div>
            {section.title}
        </Link>
    );
}

export function SiteSectionGroupItem(props: {
    group: ClientSiteSectionGroup;
    currentSection: ClientSiteSection;
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
                type="button"
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setIsVisible((prev) => !prev);
                }}
                className={`group/section-link flex w-full flex-row items-center gap-3 rounded-md straight-corners:rounded-none px-3 py-2 text-left transition-all hover:bg-tint-hover hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint ${
                    isActiveGroup
                        ? 'font-semibold text-primary hover:bg-primary-hover hover:text-primary-strong contrast-more:text-primary-strong contrast-more:hover:ring-1 contrast-more:hover:ring-primary-hover'
                        : null
                }`}
            >
                <div
                    className={tcls(
                        'flex size-8 shrink-0 items-center justify-center rounded-md straight-corners:rounded-none bg-tint-subtle text-lg text-tint leading-none shadow-sm shadow-tint ring-1 ring-tint-subtle transition-transform group-hover/section-link:scale-110 group-hover/section-link:ring-tint-hover group-active/section-link:scale-90 group-active/section-link:shadow-none contrast-more:text-tint-strong dark:shadow-none',
                        isActiveGroup
                            ? 'bg-primary tint:bg-primary-solid text-primary tint:text-contrast-primary-solid shadow-md shadow-primary ring-primary group-hover/section-link:ring-primary-hover, contrast-more:text-primary-strong contrast-more:ring-2 contrast-more:ring-primary'
                            : null
                    )}
                >
                    {group.icon ? (
                        <SectionIcon icon={group.icon as IconName} isActive={isActiveGroup} />
                    ) : (
                        <span className={`text-sm opacity-8 ${isActiveGroup && 'opacity-10'}`}>
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
