'use client';

import { NavigationMenu } from '@base-ui/react/navigation-menu';
import React from 'react';

import type { IconName } from '@gitbook/icons';

import { CONTAINER_STYLE } from '../layout';
import { ScrollContainer } from '../primitives/ScrollContainer';
import type {
    ClientSiteExternalLink,
    ClientSiteSection,
    ClientSiteSectionGroup,
    ClientSiteSections,
} from './encodeClientSiteSections';
import { SectionIcon } from './SectionIcon';
import { Button, Link, ToggleChevron } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';
import { findSectionInGroup } from '@/lib/utils';

const SCREEN_OFFSET = 16; // 1rem
const POPUP_OFFSET = 4;
const OPEN_DELAY_MS = 200;
const MOTION = 'duration-300 ease-[cubic-bezier(0.83,0,0.17,1)]';
// Bounds the scrolling content too: the popup settles at `height: auto`, so `h-full` doesn't.
const MAX_POPUP_HEIGHT = 'max-h-[calc(100vh-8rem)]';
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
            className={tcls(
                CONTAINER_STYLE,
                'relative z-10 flex w-full flex-nowrap items-end',
                'page-default-width:2xl:px-[calc((100%-1536px+4rem)/2)]',
                className
            )}
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
                className={tcls(
                    'grow',
                    'md:-ml-8 -ml-4 sm:-ml-6',
                    !children
                        ? 'md:-mr-8 -mr-4 sm:-mr-6'
                        : 'after:contents[] after:absolute after:inset-y-2 after:right-0 after:border-transparent after:border-r after:transition-colors'
                )}
                active={`#${currentSection.id}`}
                trailing={{
                    fade: true,
                    button: true,
                    className: children ? 'after:border-tint' : '',
                }}
            >
                <NavigationMenu.List
                    className={tcls(
                        'flex grow gap-2 bg-transparent',
                        'pl-1 sm:pl-3 md:pl-5',
                        !children ? 'pr-1 sm:pr-3 md:pr-5' : 'pr-1'
                    )}
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
                                        <NavigationMenu.Content
                                            className={tcls(
                                                'h-full w-full overflow-y-auto overflow-x-hidden md:w-max md:max-w-(--available-width)',
                                                MAX_POPUP_HEIGHT,
                                                `transition-[opacity,translate] ${MOTION}`,
                                                'data-ending-style:opacity-0 data-starting-style:opacity-0',
                                                'data-starting-style:data-[activation-direction=left]:-translate-x-1/2 data-ending-style:data-[activation-direction=left]:translate-x-1/2',
                                                'data-ending-style:data-[activation-direction=right]:-translate-x-1/2 data-starting-style:data-[activation-direction=right]:translate-x-1/2'
                                            )}
                                        >
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
                    className={tcls(
                        'z-20 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) outline-hidden',
                        `transition-[top,left,right,bottom] ${MOTION} data-instant:transition-none`
                    )}
                    sideOffset={POPUP_OFFSET}
                    collisionPadding={SCREEN_OFFSET}
                    // Flipping above the tabs would hide the popup behind the header.
                    collisionAvoidance={{ side: 'none' }}
                >
                    <NavigationMenu.Popup
                        className={tcls(
                            'relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) overflow-hidden circular-corners:rounded-3xl rounded-corners:rounded-xl border border-tint bg-tint-base shadow-lg outline-hidden',
                            // Sized here rather than on the content, so the border doesn't push the
                            // content off-centre and eat the padding down one side.
                            'max-md:w-[calc(100vw-2rem)]',
                            MAX_POPUP_HEIGHT,
                            // `scale` rather than `transform`: that is what `scale-95` sets.
                            `transition-[opacity,scale,width,height] ${MOTION}`,
                            // The size vars reset on close, so animating them out collapses the
                            // panel and grows it back as it fades.
                            'data-ending-style:transition-[opacity,scale]',
                            'data-ending-style:scale-95 data-starting-style:scale-95 data-ending-style:opacity-0 data-starting-style:opacity-0'
                        )}
                    >
                        <NavigationMenu.Viewport className="relative h-full w-full overflow-hidden" />
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
            className={tcls(
                'group/dropdown relative my-1.5 overflow-visible',
                isActive
                    ? 'after:contents-[] after:-bottom-1.5 bg-transparent text-primary-subtle after:absolute after:inset-x-3 after:h-0.5 after:bg-primary-9'
                    : ''
            )}
            href={url}
        />
    );
});

/**
 * A list of section tiles grouped in the dropdown for a section group
 */
function SectionGroupTileList(props: {
    items: (ClientSiteSection | ClientSiteSectionGroup | ClientSiteExternalLink)[];
    currentSection: ClientSiteSection;
}) {
    const { items, currentSection } = props;

    // Separate leaf items (sections, external links) from grouped items
    const leaves = items.filter((item) => item.object !== 'site-section-group');
    const groups = items.filter((item) => item.object === 'site-section-group');

    const hasLeaves = leaves.length > 0;
    const hasGroups = groups.length > 0;
    // Loose navigation items only lead when the structure opens with one, otherwise they read as secondary links and trail the groups.
    const leavesLead = items[0]?.object !== 'site-section-group';
    const isMasonryLayout = groups.length > GROUP_MASONRY_THRESHOLD;
    const masonryRows = groups.reduce((total, group) => total + 1 + group.children.length, 0); // title + sections
    const masonryColumnCount = Math.min(
        Math.max(Math.ceil(groups.length / 2), Math.ceil(masonryRows / MAX_ITEMS_PER_COLUMN)),
        MAX_MASONRY_COLUMNS
    );

    // Whichever panel comes second is recessed: it carries the divider, the background and inverted tile icons.
    const leavesRecessed = hasGroups && !leavesLead;
    const groupsRecessed = hasLeaves && leavesLead;
    const RECESSED_PANEL = 'border-tint-subtle bg-tint-subtle max-md:border-t md:border-l';

    // Non-grouped navigation items. The wrapper spans the dropdown's height, so the list itself can stay content-sized.
    const leavesPanel = hasLeaves ? (
        <div
            className={tcls(
                'w-full shrink-0 md:w-max',
                hasGroups ? (leavesRecessed ? RECESSED_PANEL : 'bg-tint-base') : ''
            )}
        >
            <ul
                className="flex w-full grid-flow-row flex-col gap-x-2 gap-y-0.5 p-3 md:grid md:w-max"
                style={{
                    gridTemplateColumns: `repeat(${Math.ceil(leaves.length / MAX_ITEMS_PER_COLUMN)}, minmax(0, 1fr))`,
                }}
            >
                {leaves.map((leaf) => (
                    <SectionGroupTile
                        key={leaf.id}
                        child={leaf}
                        currentSection={currentSection}
                        invertIcon={leavesRecessed}
                    />
                ))}
            </ul>
        </div>
    ) : null;

    // Grouped sections
    const groupsPanel = hasGroups ? (
        <div
            className={tcls(
                'w-full md:w-max md:min-w-0 md:max-w-full',
                groupsRecessed ? RECESSED_PANEL : ''
            )}
        >
            <ul
                className={tcls(
                    'p-3',
                    isMasonryLayout
                        ? 'w-full max-md:space-y-8 md:max-w-[var(--masonry-max-width)] md:gap-x-[var(--site-section-column-gap)] md:[column-count:var(--masonry-columns)] md:[column-width:var(--site-section-column-min-width)] md:[&>li]:mb-4'
                        : 'flex w-full flex-col justify-start space-y-8 md:w-max md:flex-row md:items-start md:gap-[var(--site-section-column-gap)] md:space-y-0'
                )}
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
        <div className="flex w-full flex-col md:flex-row">
            {leavesLead ? (
                <>
                    {leavesPanel}
                    {groupsPanel}
                </>
            ) : (
                <>
                    {groupsPanel}
                    {leavesPanel}
                </>
            )}
        </div>
    );
}

/**
 * A section tile shown in the dropdown for a section group
 */
function SectionGroupTile(props: {
    child: ClientSiteSection | ClientSiteSectionGroup | ClientSiteExternalLink;
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
            <li className="group/section-tile flex w-full min-w-0 shrink-0 grow md:max-w-[var(--site-section-tile-max-width)]">
                <Link
                    href={url}
                    className={tcls(
                        'grow circular-corners:rounded-2xl rounded-corners:rounded-lg px-2.5 py-1.5 transition-colors',
                        isActive
                            ? 'bg-primary-active text-primary-strong'
                            : 'text-tint-strong hover:bg-tint-hover'
                    )}
                >
                    <div className="mb-auto flex min-w-0 grow items-center gap-2">
                        {icon && (
                            <div
                                className={tcls(
                                    '-ml-1 self-start circular-corners:rounded-2xl rounded-corners:rounded-lg p-2 transition-colors',
                                    isActive || invertIcon ? 'bg-primary-base' : 'bg-tint',
                                    isActive
                                        ? 'text-primary-subtle'
                                        : 'text-tint-strong group-hover/section-tile:bg-tint-base'
                                )}
                            >
                                <SectionIcon isActive={isActive} icon={icon as IconName} />
                            </div>
                        )}
                        <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="block min-w-0 whitespace-normal">{title}</span>
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
        <li
            className={tcls(
                'flex w-full min-w-0 shrink-0 break-inside-avoid flex-col gap-1 md:w-auto',
                spansMasonry ? 'md:[column-span:all]' : ''
            )}
        >
            <div className="mb-1 mt-2 flex min-w-0 gap-2 px-2.5 font-heading text-xs font-semibold text-tint-subtle">
                {icon && (
                    <SectionIcon className="mt-0.5" isActive={false} icon={icon as IconName} />
                )}
                <span className="min-w-0 flex-1 whitespace-normal">{title}</span>
            </div>
            <ul
                className={tcls(
                    'flex w-full flex-col gap-x-2 gap-y-0.5',
                    spansMasonry
                        ? // Same track sizing as the masonry it spans, so its sections line up with the
                          // groups around it however many columns the width allows.
                          'md:block md:gap-x-[var(--site-section-column-gap)] md:[column-count:var(--masonry-columns)] md:[column-width:var(--site-section-column-min-width)] md:[&>li]:mb-0.5 md:[&>li]:break-inside-avoid'
                        : 'grid-flow-row md:grid'
                )}
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
