'use client';

import type { SiteSection } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';

import { Link } from '@/components/primitives';
import { SectionsList } from '@/lib/api';
import { tcls } from '@/lib/tailwind';

import { SectionIcon } from './SectionIcon';

const VIEWPORT_ITEM_WIDTH = 240; /* width of the tile (w-60) */
const MIN_ITEMS_FOR_COLS = 4; /* number of items to switch to 2 columns */
/**
 * A set of navigational links representing site sections for multi-section sites
 */
export function SiteSectionTabs(props: { sections: SectionsList }) {
    const {
        sections: { list: sectionsAndGroups, current: currentSection },
    } = props;
    const [value, setValue] = React.useState<string | null>();
    const [offset, setOffset] = React.useState<number | null>(null);
    const scrollableViewRef = React.useRef<HTMLDivElement>(null);

    const onNodeUpdate = (
        trigger: HTMLButtonElement | null,
        itemValue: string,
        size: number = 0,
    ) => {
        const windowWidth = document.documentElement.clientWidth;
        if (windowWidth < 768) { // if the screen is small don't offset the menu
            setOffset(0);
        } else if (trigger && value === itemValue) {
            const padding = 16;
            const viewportWidth =
                size < MIN_ITEMS_FOR_COLS ? VIEWPORT_ITEM_WIDTH + padding : (VIEWPORT_ITEM_WIDTH * 2) + padding;
            const scrollLeft = scrollableViewRef.current?.scrollLeft ?? 0;
            const triggerOffset = (trigger.offsetLeft - scrollLeft); // offset of the trigger from the left edge including scrolling
            const bufferLeft = 2; // offset the menu viewport should not pass on the left side of window
            const bufferRight = windowWidth - (16 + viewportWidth); // offset the menu viewport should not pass on the right side of the window
            setOffset(
                // constrain to within the window with some buffer on the left and right we don't want the menu to enter
                Math.min(
                    bufferRight,
                    Math.max(
                        bufferLeft,
                        Math.round(triggerOffset)
                    ),
                ),
            );
        } else if (!value) {
            setOffset(null);
        }
    };

    return sectionsAndGroups.length > 0 ? (
        <NavigationMenu.Root
            aria-label="Sections"
            onValueChange={setValue}
            className="w-full relative z-10 flex flex-nowrap items-center max-w-screen-2xl mx-auto page-full-width:max-w-full"
        >
            <div ref={scrollableViewRef}
                className="w-full hide-scroll overflow-x-scroll overflow-y-hidden pb-4 -mb-4" /* Positive padding / negative margin allows the navigation menu indicator to show in a scroll view */
            >
                <NavigationMenu.List className="center m-0 flex list-none bg-transparent px-1 sm:px-3 md:px-5 gap-2">
                    {sectionsAndGroups.map((sectionOrGroup) => {
                        const { id, title, icon } = sectionOrGroup;
                        const isGroup = sectionOrGroup.object === 'site-section-group';
                        const isActiveGroup =
                            isGroup &&
                            Boolean(
                                sectionOrGroup.sections.find((s) => s.id === currentSection.id),
                            );
                        const isActive = isActiveGroup || id === currentSection.id;
                        return (
                            <NavigationMenu.Item key={id} value={id}>
                                {isGroup ? (
                                    sectionOrGroup.sections.length > 0 ? (
                                        <>
                                            <NavigationMenu.Trigger
                                                ref={(node) =>
                                                    onNodeUpdate(
                                                        node,
                                                        id,
                                                        sectionOrGroup.sections.length,
                                                    )
                                                }
                                                asChild
                                            >
                                                <SectionGroupTab
                                                    isActive={isActive}
                                                    title={title}
                                                    icon={icon as IconName}
                                                />
                                            </NavigationMenu.Trigger>
                                            <NavigationMenu.Content className="absolute z-20 left-0 top-0 w-full md:w-max data-[motion=from-end]:motion-safe:animate-enterFromRight data-[motion=from-start]:motion-safe:animate-enterFromLeft data-[motion=to-end]:motion-safe:animate-exitToRight data-[motion=to-start]:motion-safe:animate-exitToLeft">
                                                <SectionGroupTileList
                                                    sections={
                                                        sectionOrGroup.sections as SiteSection[]
                                                    }
                                                    currentSection={currentSection}
                                                />
                                            </NavigationMenu.Content>
                                        </>
                                    ) : null
                                ) : (
                                    <NavigationMenu.Link asChild>
                                        <SectionTab
                                            url={sectionOrGroup.urls.published ?? ''}
                                            isActive={isActive}
                                            title={title}
                                            icon={icon ? (icon as IconName) : undefined}
                                        />
                                    </NavigationMenu.Link>
                                )}
                            </NavigationMenu.Item>
                        );
                    })}
                    <NavigationMenu.Indicator
                        className="top-full z-0 flex h-3 items-end justify-center motion-safe:transition-[width,_transform] data-[state=hidden]:motion-safe:animate-fadeOut data-[state=visible]:motion-safe:animate-fadeIn"
                        aria-hidden
                    >
                        <div className="bg-tint shadow-1xs shadow-dark/1 dark:shadow-dark/4 relative top-[70%] size-3 rotate-[225deg] rounded-tl-sm" />
                    </NavigationMenu.Indicator>
                </NavigationMenu.List>
            </div>
            <div
                className="absolute top-full flex transition-transform duration-200 ease-in-out"
                style={{
                    display: offset === null ? 'none' : undefined,
                    transform: offset ? `translateX(${offset}px)` : undefined,
                }}
            >
                <NavigationMenu.Viewport
                    className="bg-tint rounded straight-corners:rounded-none shadow-1xs shadow-dark/1 dark:shadow-dark/4 relative mt-3 ml-4 md:mx-0 w-[calc(100vw_-_2rem)] md:w-[var(--radix-navigation-menu-viewport-width)] h-[var(--radix-navigation-menu-viewport-height)] origin-[top_center] overflow-hidden motion-safe:transition-[width,_height,_transform] duration-250 data-[state=closed]:duration-150 data-[state=closed]:motion-safe:animate-scaleOut data-[state=open]:motion-safe:animate-scaleIn"
                    style={{
                        translate: undefined /* don't move this to a Tailwind class as Radix renders viewport incorrectly for a few frames */,
                    }}
                />
            </div>
        </NavigationMenu.Root>
    ) : null;
}

/**
 * A tab representing a section
 */
const SectionTab = React.forwardRef(function SectionTab(
    props: { isActive: boolean; title: string; icon?: IconName; url: string },
    ref: React.Ref<HTMLAnchorElement>,
) {
    const { isActive, title, icon, url, ...rest } = props;
    return (
        <Link
            ref={ref}
            {...rest}
            className={tcls(
                'relative group flex select-none items-center justify-between rounded straight-corners:rounded-none px-3 py-1 my-2',
                isActive
                    ? 'text-primary-subtle'
                    : 'text-tint hover:bg-tint-hover hover:text-tint-strong',
            )}
            href={url}
        >
            <span className="flex gap-2 items-center w-full truncate">
                {icon ? <SectionIcon isActive={isActive} icon={icon} /> : null}
                {title}
            </span>
            {isActive ? <ActiveTabIndicator /> : null}
        </Link>
    );
});

/**
 * A tab representing a section group
 */
const SectionGroupTab = React.forwardRef(function SectionGroupTab(
    props: { isActive: boolean; title: string; icon?: IconName },
    ref: React.Ref<HTMLButtonElement>,
) {
    const { isActive, title, icon, ...rest } = props;
    return (
        <button
            ref={ref}
            {...rest}
            className={tcls(
                'relative group flex select-none items-center justify-between rounded straight-corners:rounded-none transition-colors px-3 py-1 my-2',
                isActive
                    ? 'text-primary-subtle'
                    : 'text-tint hover:bg-tint-hover hover:text-tint-strong',
            )}
        >
            <span className="flex gap-2 items-center w-full truncate">
                {icon ? <SectionIcon isActive={isActive} icon={icon as IconName} /> : null}
                {title}
            </span>
            {isActive ? <ActiveTabIndicator /> : null}
            <Icon
                aria-hidden
                icon="chevron-down"
                className="shrink-0 size-3 opacity-6 ms-1 transition-all group-data-[state=open]:rotate-180"
            />
        </button>
    );
});

/**
 * Horizontal line indicating the active tab
 */
function ActiveTabIndicator() {
    return (
        <span className="inset-x-3 -bottom-2 h-0.5 absolute bg-primary-9 contrast-more:bg-primary-11" />
    );
}

/**
 * A list of section tiles grouped in the dropdown for a section group
 */
function SectionGroupTileList(props: { sections: SiteSection[]; currentSection: SiteSection }) {
    const { sections, currentSection } = props;
    return (
        <ul
            className={tcls(
                'grid w-full md:w-max p-2 sm:grid-cols-1',
                sections.length < MIN_ITEMS_FOR_COLS ? 'md:grid-cols-1' : 'md:grid-cols-2',
            )}
        >
            {sections.map((section) => (
                <SectionGroupTile
                    key={section.id}
                    section={section}
                    isActive={section.id === currentSection.id}
                />
            ))}
        </ul>
    );
}

/**
 * A section tile shown in the dropdown for a section group
 */
function SectionGroupTile(props: { section: SiteSection; isActive: boolean }) {
    const { section, isActive } = props;
    const { urls, icon, title } = section;
    return (
        <li className="flex w-full md:w-60">
            <Link
                href={urls.published ?? ''}
                className={tcls(
                    'flex flex-col p-3 gap-2 rounded w-full min-h-12 select-none transition-colors hover:bg-tint-hover',
                    isActive
                        ? 'text-primary hover:text-primary-strong focus:text-primary-strong'
                        : 'text-tint hover:text-tint-strong focus:text-tint-strong',
                )}
            >
                <div className="flex gap-2 items-center w-full font-medium light:text-dark dark:text-light">
                    {icon ? <SectionIcon isActive={false} icon={icon as IconName} /> : null}
                    <span className="truncate min-w-0">{title}</span>
                </div>
                <p className="text-tint-subtle">{section.description}</p>
            </Link>
        </li>
    );
}
