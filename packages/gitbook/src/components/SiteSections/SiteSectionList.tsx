'use client';

import assertNever from 'assert-never';
import { motion } from 'motion/react';
import React from 'react';

import type { IconName } from '@gitbook/icons';

import { useToggleAnimation } from '../hooks';
import { Link, ToggleChevron } from '../primitives';
import { ScrollContainer } from '../primitives/ScrollContainer';
import type {
    ClientSiteNavigationItem,
    ClientSiteSection,
    ClientSiteSectionGroup,
    ClientSiteSections,
} from './encodeClientSiteSections';
import { SectionIcon } from './SectionIcon';
import { type ClassValue, cx } from '@/lib/classnames';
import { findSectionInGroup } from '@/lib/utils';

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
            <nav aria-label="Sections" className={cx('section-list', className)}>
                <ScrollContainer
                    orientation="vertical"
                    style={{ maxHeight: `${MAX_ITEMS * 3 + 2}rem` }}
                    className="pb-4"
                    active={`#${currentSection.id}`}
                >
                    <div className="section-list-items">
                        {sectionsAndGroups.map((item) => {
                            switch (item.object) {
                                case 'site-section-group':
                                    return (
                                        <SiteSectionGroupItem
                                            key={item.id}
                                            group={item}
                                            currentSection={currentSection}
                                        />
                                    );
                                case 'site-section':
                                case 'site-external-link':
                                    return (
                                        <SiteSectionListItem
                                            item={item}
                                            isActive={
                                                item.object === 'site-section' &&
                                                item.id === currentSection.id
                                            }
                                            key={item.id}
                                        />
                                    );
                                default:
                                    return assertNever(item, 'Unknown client site structure node');
                            }
                        })}
                    </div>
                </ScrollContainer>
            </nav>
        )
    );
}

export function SiteSectionListItem(props: {
    item: ClientSiteNavigationItem;
    isActive: boolean;
    className?: string;
    style?: React.CSSProperties;
}) {
    const { item, isActive, className, style, ...otherProps } = props;

    return (
        <Link
            href={item.url}
            aria-current={isActive ? 'page' : undefined}
            id={item.id}
            className={cx('section-item', className)}
            style={style}
            {...otherProps}
        >
            <div className="section-item-icon">
                {item.icon ? (
                    <SectionIcon icon={item.icon as IconName} isActive={isActive} />
                ) : (
                    <span className="section-item-abbr">{item.title.substring(0, 2)}</span>
                )}
            </div>
            {item.title}
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
                className={cx('section-item-group', isActiveGroup && 'section-item-current')}
            >
                <div className="section-item-icon">
                    {group.icon ? (
                        <SectionIcon icon={group.icon as IconName} isActive={isActiveGroup} />
                    ) : (
                        <span className="section-item-abbr">{group.title.substring(0, 2)}</span>
                    )}
                </div>
                {group.title}
                <span className="section-item-toggle">
                    <ToggleChevron
                        open={isOpen}
                        orientation="right-to-down"
                        className="section-item-chevron"
                    />
                </span>
            </button>
            {hasDescendants ? (
                <Descendants isVisible={isOpen}>
                    {group.children.map((child) => {
                        switch (child.object) {
                            case 'site-section':
                            case 'site-external-link':
                                return (
                                    <SiteSectionListItem
                                        item={child}
                                        isActive={
                                            child.object === 'site-section' &&
                                            child.id === currentSection.id
                                        }
                                        key={child.id}
                                    />
                                );
                            case 'site-section-group':
                                return (
                                    <SiteSectionGroupItem
                                        group={child}
                                        currentSection={currentSection}
                                        key={child.id}
                                        level={level + 1}
                                    />
                                );
                            default:
                                return assertNever(child, 'Unknown client site structure node');
                        }
                    })}
                </Descendants>
            ) : null}
        </>
    );
}

function Descendants(props: { isVisible: boolean; children: React.ReactNode }) {
    const { isVisible, children } = props;
    const { show, hide, scope } = useToggleAnimation(isVisible);
    return (
        <motion.div
            ref={scope}
            className={cx('section-list-children', !isVisible && 'section-list-children-hidden')}
            initial={isVisible ? show : hide}
        >
            {children}
        </motion.div>
    );
}
