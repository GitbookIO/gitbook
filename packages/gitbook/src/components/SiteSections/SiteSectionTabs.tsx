'use client';

import { NavigationMenu } from '@base-ui/react/navigation-menu';
import React from 'react';

import type { IconName } from '@gitbook/icons';

import { CONTAINER_STYLE } from '../layout';
import { ScrollContainer } from '../primitives/ScrollContainer';
import type {
    ClientSiteSection,
    ClientSiteSections,
    ClientSiteStructureNode,
} from './encodeClientSiteSections';
import { SectionIcon } from './SectionIcon';
import { Button, Link, ToggleChevron } from '@/components/primitives';
import { cx } from '@/lib/classnames';
import { findSectionInGroup } from '@/lib/utils';

const SCREEN_OFFSET = 16; // 1rem
const POPUP_OFFSET = 4;
const OPEN_DELAY_MS = 200;
const MAX_ITEMS_PER_COLUMN = 10; // number of items per column
const GROUP_MASONRY_THRESHOLD = 3; // if a section group has more than this many child groups, it will be shown in a masonry grid
const COLUMN_WIDTH = '18rem';
// Floor for a column, so a dropdown squeezed by the sections panel or the screen drops a column
// instead of shrinking them all.
const COLUMN_MIN_WIDTH = '16rem';
const COLUMN_GAP = '2rem';
const COLUMN_PADDING = '1.5rem'; // the p-3 on the lists holding the columns
const MAX_MASONRY_COLUMNS = 4;

/**
 * A set of navigational links representing site sections for multi-section sites
 */
export function SiteSectionTabs(props: {
    sections: ClientSiteSections;
    className?: string;
    children?: React.ReactNode;
}) {
    const {
        sections: { list: structure, current: currentSection },
        className,
        children,
    } = props;

    // Portalled into the tabs container rather than <body>, to keep inheriting the header's theming.
    const containerRef = React.useRef<HTMLElement>(null);

    return structure.length > 0 ? (
        <NavigationMenu.Root
            ref={containerRef}
            className={cx(CONTAINER_STYLE, 'section-tabs', className)}
            style={
                {
                    '--site-section-column-width': COLUMN_WIDTH,
                    '--site-section-column-min-width': COLUMN_MIN_WIDTH,
                    '--site-section-column-gap': COLUMN_GAP,
                    // Lifted so the masonry can drop it and let a tile fill a column instead.
                    '--site-section-tile-max-width': COLUMN_WIDTH,
                } as React.CSSProperties
            }
            delay={OPEN_DELAY_MS}
        >
            <ScrollContainer
                orientation="horizontal"
                className={cx(
                    'section-tabs-scroll',
                    children ? 'section-tabs-scroll-divided' : 'section-tabs-scroll-full'
                )}
                active={`#${currentSection.id}`}
                trailing={{
                    fade: true,
                    button: true,
                    className: children ? 'section-tabs-scroll-more' : '',
                }}
            >
                <NavigationMenu.List
                    className={cx('section-tabs-list', !children && 'section-tabs-list-full')}
                    aria-label="Sections"
                    data-gb-sections
                >
                    {structure.map((structureItem) => {
                        const { id, title, icon } = structureItem;
                        const isGroup = structureItem.object === 'site-section-group';
                        const isActiveGroup =
                            isGroup &&
                            Boolean(findSectionInGroup(structureItem, currentSection.id));
                        const isActive =
                            isActiveGroup ||
                            (structureItem.object === 'site-section' && id === currentSection.id);
                        return (
                            <NavigationMenu.Item key={id} value={id} id={id}>
                                {isGroup && structureItem.children.length > 0 ? (
                                    <>
                                        <NavigationMenu.Trigger
                                            render={
                                                <SectionTab
                                                    isActive={isActive}
                                                    title={title}
                                                    icon={icon as IconName}
                                                />
                                            }
                                        />
                                        <NavigationMenu.Content className="section-tabs-content">
                                            <SectionGroupTileList
                                                items={structureItem.children}
                                                currentSection={currentSection}
                                            />
                                        </NavigationMenu.Content>
                                    </>
                                ) : (
                                    <NavigationMenu.Link
                                        active={isActive}
                                        render={
                                            <SectionTab
                                                url={
                                                    structureItem.object !== 'site-section-group'
                                                        ? structureItem.url
                                                        : undefined
                                                }
                                                isActive={isActive}
                                                title={title}
                                                icon={icon ? (icon as IconName) : undefined}
                                            />
                                        }
                                    />
                                )}
                            </NavigationMenu.Item>
                        );
                    })}
                </NavigationMenu.List>
            </ScrollContainer>

            {children}

            <NavigationMenu.Portal container={containerRef}>
                <NavigationMenu.Positioner
                    className="section-tabs-positioner"
                    sideOffset={POPUP_OFFSET}
                    collisionPadding={SCREEN_OFFSET}
                    // Flipping above the tabs would hide the popup behind the header.
                    collisionAvoidance={{ side: 'none' }}
                >
                    <NavigationMenu.Popup className="section-tabs-popup">
                        <NavigationMenu.Viewport className="section-tabs-viewport" />
                    </NavigationMenu.Popup>
                </NavigationMenu.Positioner>
            </NavigationMenu.Portal>
        </NavigationMenu.Root>
    ) : null;
}

/**
 * A tab representing a section or section group
 */
const SectionTab = React.forwardRef(function SectionTab(
    props: { isActive: boolean; title: string; icon?: IconName; url?: string },
    ref: React.Ref<HTMLAnchorElement>
) {
    const { isActive, title, icon, url, ...rest } = props;
    const isGroup = url === undefined;
    return (
        <Button
            ref={ref}
            size="small"
            variant="blank"
            {...rest}
            icon={icon ? <SectionIcon isActive={isActive} icon={icon} /> : null}
            label={title}
            trailing={isGroup ? <ToggleChevron /> : null}
            active={isActive}
            className={cx('group/dropdown section-tab', isActive && 'section-tab-active')}
            href={url}
        />
    );
});

/**
 * A list of section tiles grouped in the dropdown for a section group
 */
function SectionGroupTileList(props: {
    items: ClientSiteStructureNode[];
    currentSection: ClientSiteSection;
}) {
    const { items, currentSection } = props;

    // Separate navigable items (sections, external links) from grouped items.
    const navigableItems = items.filter((item) => item.object !== 'site-section-group');
    const groups = items.filter((item) => item.object === 'site-section-group');

    const hasNavigableItems = navigableItems.length > 0;
    const hasGroups = groups.length > 0;
    // Navigable items lead when the structure opens with one; otherwise they read as secondary links and trail the groups.
    const navigableItemsLead = items[0]?.object !== 'site-section-group';
    const isMasonryLayout = groups.length > GROUP_MASONRY_THRESHOLD;
    const masonryRows = groups.reduce((total, group) => total + 1 + group.children.length, 0); // title + children
    const masonryColumnCount = Math.min(
        Math.max(Math.ceil(groups.length / 2), Math.ceil(masonryRows / MAX_ITEMS_PER_COLUMN)),
        MAX_MASONRY_COLUMNS
    );

    // Whichever panel comes second is recessed: it carries the divider, the background and inverted tile icons.
    const navigableItemsRecessed = hasGroups && !navigableItemsLead;
    const groupsRecessed = hasNavigableItems && navigableItemsLead;

    // Non-grouped navigation items. The wrapper spans the dropdown's height, so the list itself can stay content-sized.
    const navigableItemsPanel = hasNavigableItems ? (
        <div
            className={cx(
                'section-panel',
                hasGroups &&
                    (navigableItemsRecessed ? 'section-panel-recessed' : 'section-panel-plain')
            )}
        >
            <ul
                className="section-links"
                style={{
                    gridTemplateColumns: `repeat(${Math.ceil(navigableItems.length / MAX_ITEMS_PER_COLUMN)}, minmax(0, 1fr))`,
                }}
            >
                {navigableItems.map((item) => (
                    <SectionGroupTile
                        key={item.id}
                        child={item}
                        currentSection={currentSection}
                        invertIcon={navigableItemsRecessed}
                    />
                ))}
            </ul>
        </div>
    ) : null;

    // Grouped navigation items.
    const groupsPanel = hasGroups ? (
        <div className={cx('section-groups-panel', groupsRecessed && 'section-panel-recessed')}>
            <ul
                className={isMasonryLayout ? 'section-groups-masonry' : 'section-groups'}
                style={
                    isMasonryLayout
                        ? ({
                              '--masonry-columns': String(masonryColumnCount),
                              // Tiles fill their column here, so the list carries the width cap
                              // they would otherwise have given it. Kept free of percentages, or
                              // it stops capping what the list asks the panel around it for.
                              '--masonry-max-width': `calc(${masonryColumnCount} * ${COLUMN_WIDTH} + ${masonryColumnCount - 1} * ${COLUMN_GAP} + ${COLUMN_PADDING})`,
                              '--site-section-tile-max-width': 'none',
                          } as React.CSSProperties)
                        : undefined
                }
            >
                {groups.map((group) => (
                    <SectionGroupTile
                        key={group.id}
                        child={group}
                        currentSection={currentSection}
                        isMasonry={isMasonryLayout}
                        invertIcon={groupsRecessed}
                    />
                ))}
            </ul>
        </div>
    ) : null;

    return (
        <div className="section-dropdown">
            {navigableItemsLead ? (
                <>
                    {navigableItemsPanel}
                    {groupsPanel}
                </>
            ) : (
                <>
                    {groupsPanel}
                    {navigableItemsPanel}
                </>
            )}
        </div>
    );
}

/**
 * A section tile shown in the dropdown for a section group
 */
function SectionGroupTile(props: {
    child: ClientSiteStructureNode;
    currentSection: ClientSiteSection;
    invertIcon?: boolean;
    /** Whether the tile is a top-level group of the dropdown's masonry layout. */
    isMasonry?: boolean;
}) {
    const { child, currentSection, invertIcon, isMasonry } = props;

    if (child.object !== 'site-section-group') {
        const { url, icon, title, description } = child;
        const isActive = child.object === 'site-section' && child.id === currentSection.id;
        return (
            <li className="section-tile">
                <Link
                    href={url}
                    className={cx('section-tile-link', isActive && 'section-tile-link-active')}
                >
                    <div className="section-tile-body">
                        {icon && (
                            <div
                                className={cx(
                                    'section-tile-icon',
                                    isActive
                                        ? 'section-tile-icon-active'
                                        : invertIcon && 'section-tile-icon-inverted'
                                )}
                            >
                                <SectionIcon isActive={isActive} icon={icon as IconName} />
                            </div>
                        )}
                        <div className="section-tile-text">
                            <span className="section-tile-title">{title}</span>
                            {description && (
                                <p className={isActive ? 'text-primary' : 'text-tint'}>
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                </Link>
            </li>
        );
    }

    // Handle nested section group
    const { title, icon, children } = child;

    // Multi-column sizes every column to the widest, so a wide group spans instead of stretching them all.
    const spansMasonry = Boolean(isMasonry) && children.length > MAX_ITEMS_PER_COLUMN;

    return (
        <li className={cx('section-group', spansMasonry && 'section-group-span')}>
            <div className="section-group-title">
                {icon && (
                    <SectionIcon className="mt-0.5" isActive={false} icon={icon as IconName} />
                )}
                <span className="section-group-label">{title}</span>
            </div>
            <ul
                className={spansMasonry ? 'section-group-list-masonry' : 'section-group-list'}
                style={
                    spansMasonry
                        ? undefined
                        : {
                              gridTemplateColumns: `repeat(${Math.ceil(children.length / MAX_ITEMS_PER_COLUMN)}, minmax(0, auto))`,
                          }
                }
            >
                {children.map((nestedChild) => (
                    <SectionGroupTile
                        key={nestedChild.id}
                        child={nestedChild}
                        currentSection={currentSection}
                        invertIcon={invertIcon}
                    />
                ))}
            </ul>
        </li>
    );
}
