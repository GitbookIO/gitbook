'use client';

import type { IconName } from '@gitbook/icons';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';

import { Button, Link, ToggleChevron } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';
import { findSectionInGroup } from '@/lib/utils';
import { markSpaceNavigationFromPickerOnClick } from '../hooks';
import { useIsMobile } from '../hooks/useIsMobile';
import { CONTAINER_STYLE } from '../layout';
import { ScrollContainer } from '../primitives/ScrollContainer';
import { SectionIcon } from './SectionIcon';
import type {
    ClientSiteSection,
    ClientSiteSectionGroup,
    ClientSiteSections,
} from './encodeClientSiteSections';

const DESKTOP_BREAKPOINT = 768;
const SCREEN_OFFSET = 16; // 1rem
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

    const containerRef = React.useRef<HTMLDivElement>(null);
    const currentTriggerRef = React.useRef<HTMLButtonElement | null>(null);
    const [value, setValue] = React.useState<string | undefined>();

    const isMobile = useIsMobile(DESKTOP_BREAKPOINT);
    const offset = useNavigationMenuViewportOffset({
        value,
        isMobile,
        triggerRef: currentTriggerRef,
        containerRef,
    });
    const viewportLeft =
        !isMobile && offset !== null
            ? `clamp(0px, calc(${offset - SCREEN_OFFSET}px - var(--radix-navigation-menu-viewport-width, 0px)/2), calc(100% - var(--radix-navigation-menu-viewport-width, 0px)))`
            : '0px';

    return structure.length > 0 ? (
        <NavigationMenu.Root
            className={tcls(
                CONTAINER_STYLE,
                'relative z-10 flex w-full flex-nowrap items-end',
                'page-default-width:2xl:px-[calc((100%-1536px+4rem)/2)]',
                className
            )}
            ref={containerRef}
            onClickCapture={markSpaceNavigationFromPickerOnClick}
            style={
                {
                    '--site-section-column-width': COLUMN_WIDTH,
                    '--site-section-column-gap': COLUMN_GAP,
                } as React.CSSProperties
            }
            value={value}
            onValueChange={setValue}
            skipDelayDuration={500}
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
                            Boolean(findSectionInGroup(structureItem, currentSection.id));
                        const isActive = isActiveGroup || id === currentSection.id;
                        return (
                            <NavigationMenu.Item key={id} value={id} id={id}>
                                {isGroup && structureItem.children.length > 0 ? (
                                    <>
                                        <NavigationMenu.Trigger
                                            asChild
                                            ref={value === id ? currentTriggerRef : undefined}
                                            onClick={(e) => {
                                                // Prevent clicking the trigger from closing when the viewport is open
                                                if (value === id) {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }
                                            }}
                                        >
                                            <SectionTab
                                                isActive={isActive}
                                                title={title}
                                                icon={icon as IconName}
                                            />
                                        </NavigationMenu.Trigger>
                                        <NavigationMenu.Content
                                            className={tcls([
                                                'absolute top-0 left-0 w-full md:w-auto',
                                                'data-[motion=from-start]:*:animate-[enterFromLeft_300ms_ease_both] data-[motion=to-end]:*:animate-[exitToRight_300ms_ease_both] data-[motion=to-start]:*:animate-[exitToLeft_300ms_ease_both] motion-safe:data-[motion=from-end]:*:animate-[enterFromRight_300ms_ease_both]',
                                            ])}
                                        >
                                            <div className="max-h-[calc(100vh-8rem)] w-full overflow-y-auto overflow-x-hidden circular-corners:rounded-3xl rounded-corners:rounded-xl">
                                                <SectionGroupTileList
                                                    items={structureItem.children}
                                                    currentSection={currentSection}
                                                />
                                            </div>
                                        </NavigationMenu.Content>
                                    </>
                                ) : (
                                    <NavigationMenu.Link asChild>
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
                                    </NavigationMenu.Link>
                                )}
                            </NavigationMenu.Item>
                        );
                    })}
                </NavigationMenu.List>
            </ScrollContainer>

            {children}

            <div
                className="absolute top-full left-0 z-20 flex w-full"
                style={{ paddingInline: `${SCREEN_OFFSET}px` }}
            >
                <NavigationMenu.Viewport
                    className={tcls(
                        // Note: this layer is composited (translateZ) and animated. Chromium fails to paint a clipped composited layer's text
                        // inside an iframe or `overflow-hidden` ancestor. Clipping is done on the inner content wrapper instead.
                        'relative origin-[center_top] circular-corners:rounded-3xl rounded-corners:rounded-xl border border-tint bg-tint-base shadow-lg',
                        '-mt-0.5 h-(--radix-navigation-menu-viewport-height) w-full max-w-full md:w-(--radix-navigation-menu-viewport-width)',
                        'max-h-[calc(100vh-8rem)] data-[state=closed]:animate-scale-out data-[state=open]:animate-scale-in',
                        'ease has-[&[data-motion]]:transition-[left,width,height] has-[&[data-motion]]:duration-300'
                    )}
                    style={{
                        left: viewportLeft,
                        translate: '0 0 0', // TranslateZ is needed to force a stacking context, fixing a rendering bug on Safari
                    }}
                />
            </div>
        </NavigationMenu.Root>
    ) : null;
}

function useNavigationMenuViewportOffset(args: {
    value: string | undefined;
    isMobile: boolean;
    triggerRef: React.RefObject<HTMLButtonElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
}) {
    const { value, isMobile, triggerRef, containerRef } = args;
    const [offset, setOffset] = React.useState<number | null>(null);

    React.useLayoutEffect(() => {
        if (isMobile) {
            setOffset(null);
            return;
        }

        if (!value) {
            return;
        }

        const trigger = triggerRef.current;
        const container = containerRef.current;
        if (!trigger || !container) {
            return;
        }

        const containerLeft = container.getBoundingClientRect().left;
        const triggerWidth = trigger.getBoundingClientRect().width;
        const triggerLeft = trigger.getBoundingClientRect().left - containerLeft;

        setOffset(triggerLeft + triggerWidth / 2);
    }, [containerRef, isMobile, triggerRef, value]);

    return offset;
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
    currentSection: ClientSiteSection;
}) {
    const { items, currentSection } = props;

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
                            currentSection={currentSection}
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
                                currentSection={currentSection}
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
    currentSection: ClientSiteSection;
    invertIcon?: boolean;
}) {
    const { child, currentSection, invertIcon } = props;

    if (child.object === 'site-section') {
        const { url, icon, title, description } = child;
        const isActive = child.id === currentSection.id;
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
            <div className="mt-2 mb-1 flex min-w-0 gap-2 px-2.5 font-semibold text-tint-subtle text-xs">
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
                        currentSection={currentSection}
                        invertIcon={true}
                    />
                ))}
            </ul>
        </li>
    );
}
