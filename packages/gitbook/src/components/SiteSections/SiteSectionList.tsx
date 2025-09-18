'use client';

import { Icon, type IconName } from '@gitbook/icons';
import { motion } from 'framer-motion';
import React from 'react';

import { type ClassValue, tcls } from '@/lib/tailwind';
import { findSectionInGroup } from '@/lib/utils';
import { useToggleAnimation } from '../hooks';
import { Link } from '../primitives';
import { ScrollContainer } from '../primitives/ScrollContainer';
import { SectionIcon } from './SectionIcon';
import type {
    ClientSiteSection,
    ClientSiteSectionGroup,
    ClientSiteSections,
} from './encodeClientSiteSections';

const MAX_ITEMS = 6; // If there are more sections than this, they'll be shown below the fold in a scrollview.

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
                    '-mx-5 before:contents[] relative border-tint-subtle border-b from-transparent sidebar-filled:to-tint-subtle theme-muted:to-tint-subtle to-tint-base text-sm text-tint before:pointer-events-none before:absolute before:right-2 before:bottom-0 before:left-0 before:h-12 before:bg-linear-to-b [html.sidebar-filled.theme-bold.tint_&]:to-tint-base [html.sidebar-filled.theme-bold.tint_&]:to-tint-subtle [html.sidebar-filled.theme-muted_&]:to-tint-base',
                    className
                )}
            >
                <ScrollContainer
                    orientation="vertical"
                    style={{ maxHeight: `${MAX_ITEMS * 3 + 2}rem` }}
                    className="pb-4"
                    activeId={currentSection.id}
                >
                    <div className="flex w-full flex-col px-2">
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
                    </div>
                </ScrollContainer>
            </nav>
        )
    );
}

export function SiteSectionListItem(props: {
    section: ClientSiteSection;
    isActive: boolean;
    className?: string;
    style?: React.CSSProperties;
}) {
    const { section, isActive, className, style, ...otherProps } = props;

    return (
        <Link
            href={section.url}
            aria-current={isActive && 'page'}
            id={section.id}
            className={tcls(
                'group/section-link',
                'flex',
                'flex-row',
                'items-center',
                'gap-3',
                'rounded-md',
                'straight-corners:rounded-none',
                'circular-corners:rounded-xl',
                'px-3',
                'py-2',
                'transition-all',
                'hover:bg-tint-hover',
                'hover:text-tint-strong',
                'contrast-more:hover:ring-1',
                'contrast-more:hover:ring-tint',
                isActive
                    ? 'font-semibold text-primary-subtle hover:bg-primary-hover hover:text-primary contrast-more:text-primary contrast-more:hover:text-primary-strong contrast-more:hover:ring-1 contrast-more:hover:ring-primary-hover'
                    : null,
                className
            )}
            style={style}
            {...otherProps}
        >
            <div
                className={tcls(
                    'flex size-8 shrink-0 items-center justify-center rounded-md straight-corners:rounded-none bg-tint-subtle text-lg text-tint leading-none shadow-tint shadow-xs ring-1 ring-tint-subtle transition-transform group-hover/section-link:scale-110 group-hover/section-link:ring-tint-hover group-active/section-link:scale-90 group-active/section-link:shadow-none contrast-more:text-tint-strong dark:shadow-none',
                    isActive
                        ? 'bg-primary tint:bg-primary-original text-primary-subtle tint:text-contrast-primary-original shadow-md shadow-primary ring-primary group-hover/section-link:ring-primary-hover, contrast-more:text-primary contrast-more:ring-2 contrast-more:ring-primary'
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
    level?: number;
}) {
    const { group, currentSection, level = 0 } = props;

    const hasDescendants = group.children.length > 0;
    const isActiveGroup = Boolean(findSectionInGroup(group, currentSection.id));
    const shouldOpen = hasDescendants && isActiveGroup;
    const [isOpen, setIsOpen] = React.useState(shouldOpen);

    // Update the visibility of the children if the group becomes active.
    React.useEffect(() => {
        if (shouldOpen) {
            setIsOpen(shouldOpen);
        }
    }, [shouldOpen]);

    return (
        <>
            <button
                type="button"
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setIsOpen((prev) => !prev);
                }}
                className={`group/section-link flex w-full flex-row items-center gap-3 rounded-md straight-corners:rounded-none px-3 py-2 text-left transition-all hover:bg-tint-hover hover:text-tint-strong contrast-more:hover:ring-1 contrast-more:hover:ring-tint ${
                    isActiveGroup
                        ? 'font-semibold text-primary hover:bg-primary-hover hover:text-primary-strong contrast-more:text-primary-strong contrast-more:hover:ring-1 contrast-more:hover:ring-primary-hover'
                        : null
                }`}
            >
                <div
                    className={tcls(
                        'flex size-8 shrink-0 items-center justify-center rounded-md straight-corners:rounded-none bg-tint-subtle text-lg text-tint leading-none shadow-tint shadow-xs ring-1 ring-tint-subtle transition-transform group-hover/section-link:scale-110 group-hover/section-link:ring-tint-hover group-active/section-link:scale-90 group-active/section-link:shadow-none contrast-more:text-tint-strong dark:shadow-none',
                        isActiveGroup
                            ? 'bg-primary text-primary shadow-md shadow-primary ring-primary group-hover/section-link:ring-primary-hover, contrast-more:text-primary-strong contrast-more:ring-2 contrast-more:ring-primary'
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
                        'straight-corners:rounded-xs',
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
                        isActiveGroup && 'hover:bg-tint-hover'
                    )}
                >
                    <Icon
                        icon="chevron-right"
                        className={tcls(
                            'grid',
                            'shrink-0',
                            'size-3',
                            'm-1',
                            'transition-opacity',
                            'text-current',
                            'transition-transform',
                            'opacity-6',
                            'group-hover:opacity-11',
                            'contrast-more:opacity-11',

                            isOpen ? 'rotate-90' : 'rotate-0'
                        )}
                    />
                </span>
            </button>
            {hasDescendants ? (
                <Descendants isVisible={isOpen}>
                    {group.children.map((child) => {
                        if (child.object === 'site-section') {
                            return (
                                <SiteSectionListItem
                                    section={child}
                                    isActive={child.id === currentSection.id}
                                    key={child.id}
                                />
                            );
                        }

                        return (
                            <SiteSectionGroupItem
                                group={child}
                                currentSection={currentSection}
                                key={child.id}
                                level={level + 1}
                            />
                        );
                    })}
                </Descendants>
            ) : null}
        </>
    );
}

function Descendants(props: {
    isVisible: boolean;
    children: React.ReactNode;
}) {
    const { isVisible, children } = props;
    const { show, hide, scope } = useToggleAnimation(isVisible);
    return (
        <motion.div
            ref={scope}
            className={isVisible ? 'pl-3' : 'pl-3 [&_ul>li]:opacity-1'}
            initial={isVisible ? show : hide}
        >
            {children}
        </motion.div>
    );
}
