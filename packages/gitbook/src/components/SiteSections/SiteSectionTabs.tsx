'use client';

import type { SiteSection } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';

import { Link } from '@/components/primitives';
import type { SectionsList } from '@/lib/api';
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

    const onNodeUpdate = (trigger: HTMLButtonElement | null, itemValue: string, size = 0) => {
        const windowWidth = document.documentElement.clientWidth;
        if (windowWidth < 768) {
            // if the screen is small don't offset the menu
            setOffset(0);
        } else if (trigger && value === itemValue) {
            const padding = 16;
            const viewportWidth =
                size < MIN_ITEMS_FOR_COLS
                    ? VIEWPORT_ITEM_WIDTH + padding
                    : VIEWPORT_ITEM_WIDTH * 2 + padding;
            const scrollLeft = scrollableViewRef.current?.scrollLeft ?? 0;
            const triggerOffset = trigger.offsetLeft - scrollLeft; // offset of the trigger from the left edge including scrolling
            const bufferLeft = 2; // offset the menu viewport should not pass on the left side of window
            const bufferRight = windowWidth - (16 + viewportWidth); // offset the menu viewport should not pass on the right side of the window
            setOffset(
                // constrain to within the window with some buffer on the left and right we don't want the menu to enter
                Math.min(bufferRight, Math.max(bufferLeft, Math.round(triggerOffset)))
            );
        } else if (!value) {
            setOffset(null);
        }
    };

    return sectionsAndGroups.length > 0 ? (
        <NavigationMenu.Root
            aria-label="Sections"
            onValueChange={setValue}
            className="relative z-10 mx-auto flex w-full max-w-screen-2xl page-full-width:max-w-full flex-nowrap items-center"
        >
            <div
                ref={scrollableViewRef}
                className="hide-scroll -mb-4 w-full overflow-y-hidden overflow-x-scroll pb-4" /* Positive padding / negative margin allows the navigation menu indicator to show in a scroll view */
            >
                <NavigationMenu.List className="center m-0 flex list-none gap-2 bg-transparent px-1 sm:px-3 md:px-5">
                    {sectionsAndGroups.map((sectionOrGroup) => {
                        const { id, title, icon } = sectionOrGroup;
                        const isGroup = sectionOrGroup.object === 'site-section-group';
                        const isActiveGroup =
                            isGroup &&
                            Boolean(
                                sectionOrGroup.sections.find((s) => s.id === currentSection.id)
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
                                                        sectionOrGroup.sections.length
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
                                            <NavigationMenu.Content className="absolute top-0 left-0 z-20 w-full data-[motion=from-end]:motion-safe:animate-enterFromRight data-[motion=from-start]:motion-safe:animate-enterFromLeft data-[motion=to-end]:motion-safe:animate-exitToRight data-[motion=to-start]:motion-safe:animate-exitToLeft md:w-max">
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
                        className="top-full z-0 flex h-3 items-end justify-center duration-150 motion-safe:transition-[width,_transform] data-[state=hidden]:motion-safe:animate-fadeOut data-[state=visible]:motion-safe:animate-fadeIn"
                        aria-hidden
                    >
                        <div className="relative top-[70%] size-3 rotate-[225deg] rounded-tl-sm bg-tint shadow-1xs shadow-dark/1 dark:shadow-dark/4" />
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
                    className="relative mt-3 ml-4 h-[var(--radix-navigation-menu-viewport-height)] w-[calc(100vw_-_2rem)] origin-[top_center] overflow-hidden rounded straight-corners:rounded-none bg-tint shadow-1xs shadow-dark/1 duration-250 data-[state=closed]:duration-150 motion-safe:transition-[width,_height,_transform] data-[state=closed]:motion-safe:animate-scaleOut data-[state=open]:motion-safe:animate-scaleIn md:mx-0 md:w-[var(--radix-navigation-menu-viewport-width)] dark:shadow-dark/4"
                    style={{
                        translate:
                            undefined /* don't move this to a Tailwind class as Radix renders viewport incorrectly for a few frames */,
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
    ref: React.Ref<HTMLAnchorElement>
) {
    const { isActive, title, icon, url, ...rest } = props;
    return (
        <Link
            ref={ref}
            {...rest}
            className={tcls(
                'group relative my-2 flex select-none items-center justify-between rounded straight-corners:rounded-none px-3 py-1',
                isActive
                    ? 'text-primary-subtle'
                    : 'text-tint hover:bg-tint-hover hover:text-tint-strong'
            )}
            href={url}
        >
            <span className="flex w-full items-center gap-2 truncate">
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
    ref: React.Ref<HTMLButtonElement>
) {
    const { isActive, title, icon, ...rest } = props;
    return (
        <button
            ref={ref}
            {...rest}
            className={tcls(
                'group relative my-2 flex select-none items-center justify-between rounded straight-corners:rounded-none px-3 py-1 transition-colors',
                isActive
                    ? 'text-primary-subtle'
                    : 'text-tint hover:bg-tint-hover hover:text-tint-strong'
            )}
        >
            <span className="flex w-full items-center gap-2 truncate">
                {icon ? <SectionIcon isActive={isActive} icon={icon as IconName} /> : null}
                {title}
            </span>
            {isActive ? <ActiveTabIndicator /> : null}
            <Icon
                aria-hidden
                icon="chevron-down"
                className="ms-1 size-3 shrink-0 opacity-6 transition-all group-data-[state=open]:rotate-180"
            />
        </button>
    );
});

/**
 * Horizontal line indicating the active tab
 */
function ActiveTabIndicator() {
    return (
        <span className="-bottom-2 absolute inset-x-3 h-0.5 bg-primary-9 contrast-more:bg-primary-11" />
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
                'grid w-full p-2 sm:grid-cols-1 md:w-max',
                sections.length < MIN_ITEMS_FOR_COLS ? 'md:grid-cols-1' : 'md:grid-cols-2'
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
                    'flex min-h-12 w-full select-none flex-col gap-2 rounded p-3 transition-colors hover:bg-tint-hover',
                    isActive
                        ? 'text-primary hover:text-primary-strong focus:text-primary-strong'
                        : 'text-tint hover:text-tint-strong focus:text-tint-strong'
                )}
            >
                <div className="flex w-full items-center gap-2 font-medium light:text-dark dark:text-light">
                    {icon ? <SectionIcon isActive={false} icon={icon as IconName} /> : null}
                    <span className="min-w-0 truncate">{title}</span>
                </div>
                <p className="text-tint-subtle">{section.description}</p>
            </Link>
        </li>
    );
}
