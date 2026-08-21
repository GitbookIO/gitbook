'use client';

import { NavigationMenu } from '@base-ui/react/navigation-menu';
import React from 'react';

import type { IconName } from '@gitbook/icons';

import { useSelectedSiteSectionId } from '../hooks';
import { CONTAINER_STYLE } from '../layout';
import { ScrollContainer } from '../primitives/ScrollContainer';
import type {
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
const MAX_ITEMS_PER_COLUMN = 10; // number of items per column
const GROUP_MASONRY_THRESHOLD = 3; // if a section group has more than this many child groups, it will be shown in a masonry grid
const COLUMN_WIDTH = '18rem';
const COLUMN_GAP = '2rem';
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

    const currentSectionId = useSelectedSiteSectionId(currentSection.id);

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
                    '--site-section-column-gap': COLUMN_GAP,
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
                active={currentSectionId ? `#${currentSectionId}` : undefined}
                trailing={{
                    fade: true,
                    button: true,
                    className: children ? 'after:border-tint' : '',
                }}
            >
                <NavigationMenu.List
                    className={tcls(
                        '-mx-3 flex grow gap-2 bg-transparent',
                        'pl-4 sm:pl-6 md:pl-8',
                        !children ? 'pr-4 sm:pr-6 md:pr-8' : 'pr-4'
                    )}
                    aria-label="Sections"
                    data-gb-sections
                >
                    {structure.map((structureItem) => {
                        const { id, title, icon } = structureItem;
                        const isGroup = structureItem.object === 'site-section-group';
                        const isActiveGroup =
                            isGroup &&
                            currentSectionId !== null &&
                            Boolean(findSectionInGroup(structureItem, currentSectionId));
                        const isActive = isActiveGroup || id === currentSectionId;
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
                                                'h-full w-[calc(100vw-2rem)] overflow-y-auto overflow-x-hidden md:w-max md:max-w-(--available-width)',
                                                `transition-[opacity,translate] ${MOTION}`,
                                                'data-ending-style:opacity-0 data-starting-style:opacity-0',
                                                'data-starting-style:data-[activation-direction=left]:-translate-x-1/2 data-ending-style:data-[activation-direction=left]:translate-x-1/2',
                                                'data-ending-style:data-[activation-direction=right]:-translate-x-1/2 data-starting-style:data-[activation-direction=right]:translate-x-1/2'
                                            )}
                                        >
                                            <SectionGroupTileList
                                                items={structureItem.children}
                                                currentSectionId={currentSectionId}
                                            />
                                        </NavigationMenu.Content>
                                    </>
                                ) : (
                                    <NavigationMenu.Link
                                        active={isActive}
                                        render={
                                            <SectionTab
                                                url={
                                                    structureItem.object === 'site-section'
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
                            'relative h-(--popup-height) max-h-[calc(100vh-8rem)] w-(--popup-width) origin-(--transform-origin) overflow-hidden circular-corners:rounded-3xl rounded-corners:rounded-xl border border-tint bg-tint-base shadow-lg outline-hidden',
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
    items: (ClientSiteSection | ClientSiteSectionGroup)[];
    currentSectionId: string | null;
}) {
    const { items, currentSectionId } = props;

    // Separate non-grouped sections from grouped sections
    const sections = items.filter((item) => item.object === 'site-section');
    const groups = items.filter((item) => item.object === 'site-section-group');

    const hasSections = sections.length > 0;
    const hasGroups = groups.length > 0;
    const isMasonryLayout = groups.length > GROUP_MASONRY_THRESHOLD;
    const masonryColumnCount = Math.min(Math.ceil(groups.length / 2), MAX_MASONRY_COLUMNS);

    return (
        <div className="flex w-full flex-col md:flex-row">
            {/* Non-grouped sections */}
            {hasSections && (
                <ul
                    className={tcls(
                        'flex w-full shrink-0 grid-flow-row flex-col gap-x-2 gap-y-0.5 self-stretch p-3 md:sticky md:top-0 md:grid md:w-max md:self-start',
                        hasGroups ? 'bg-tint-base' : ''
                    )}
                    style={{
                        gridTemplateColumns: `repeat(${Math.ceil(sections.length / MAX_ITEMS_PER_COLUMN)}, minmax(0, 1fr))`,
                    }}
                >
                    {sections.map((section) => (
                        <SectionGroupTile
                            key={section.id}
                            child={section}
                            currentSectionId={currentSectionId}
                        />
                    ))}
                </ul>
            )}

            {/* Grouped sections */}
            {hasGroups && (
                <div
                    className={tcls(
                        'w-full md:w-max md:min-w-0 md:max-w-full',
                        hasSections
                            ? 'border-tint-subtle bg-tint-subtle max-md:border-t md:border-l'
                            : ''
                    )}
                >
                    <ul
                        className={tcls(
                            'p-3',
                            isMasonryLayout
                                ? 'w-full max-md:space-y-8 md:w-max md:max-w-full md:gap-x-[var(--site-section-column-gap)] md:[column-count:var(--masonry-columns)] md:[&>li]:mb-4'
                                : 'flex w-full flex-col justify-start space-y-8 md:w-max md:flex-row md:items-start md:gap-[var(--site-section-column-gap)] md:space-y-0'
                        )}
                        style={
                            isMasonryLayout
                                ? ({
                                      '--masonry-columns': String(masonryColumnCount),
                                  } as React.CSSProperties)
                                : undefined
                        }
                    >
                        {groups.map((group) => (
                            <SectionGroupTile
                                key={group.id}
                                child={group}
                                currentSectionId={currentSectionId}
                            />
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

/**
 * A section tile shown in the dropdown for a section group
 */
function SectionGroupTile(props: {
    child: ClientSiteSection | ClientSiteSectionGroup;
    currentSectionId: string | null;
    invertIcon?: boolean;
}) {
    const { child, currentSectionId, invertIcon } = props;

    if (child.object === 'site-section') {
        const { url, icon, title, description } = child;
        const isActive = child.id === currentSectionId;
        return (
            <li className="group/section-tile flex w-full min-w-0 shrink-0 grow md:max-w-[var(--site-section-column-width)]">
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

    return (
        <li className="flex w-full min-w-0 shrink-0 break-inside-avoid flex-col gap-1 md:w-auto">
            <div className="mb-1 mt-2 flex min-w-0 gap-2 px-2.5 text-xs font-semibold text-tint-subtle">
                {icon && (
                    <SectionIcon className="mt-0.5" isActive={false} icon={icon as IconName} />
                )}
                <span className="min-w-0 flex-1 whitespace-normal">{title}</span>
            </div>
            <ul
                className="flex w-full grid-flow-row flex-col gap-x-2 gap-y-0.5 md:grid"
                style={{
                    gridTemplateColumns: `repeat(${Math.ceil(children.length / MAX_ITEMS_PER_COLUMN)}, minmax(0, auto))`,
                }}
            >
                {children.map((nestedChild) => (
                    <SectionGroupTile
                        key={nestedChild.id}
                        child={nestedChild}
                        currentSectionId={currentSectionId}
                        invertIcon={true}
                    />
                ))}
            </ul>
        </li>
    );
}
