'use client';

import { Icon, type IconName } from '@gitbook/icons';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';

import { Link } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';
import { SectionIcon } from './SectionIcon';
import type { ClientSiteSection, ClientSiteSections } from './encodeClientSiteSections';

const VIEWPORT_ITEM_WIDTH = 240; /* width of the tile (w-60) */
const MIN_ITEMS_FOR_COLS = 4; /* number of items to switch to 2 columns */
/**
 * A set of navigational links representing site sections for multi-section sites
 */
export function SiteSectionTabs(props: { sections: ClientSiteSections }) {
    const {
        sections: { list: sectionsAndGroups, current: currentSection },
    } = props;
    const [value, setValue] = React.useState<string | null>();
    const [offset, setOffset] = React.useState<number | null>(null);
    const menuContainerRef = React.useRef<HTMLDivElement>(null);

    const onNodeUpdate = (trigger: HTMLButtonElement | null, itemValue: string, size = 0) => {
        const padding = 16;
        const margin = -12; // Offsetting the menu container's negative margin
        const windowWidth = document.documentElement.clientWidth;
        const windowBuffer = 16; // constrain to within the window with some buffer on the left and right we don't want the menu to enter
        const viewportWidth =
            size < MIN_ITEMS_FOR_COLS
                ? VIEWPORT_ITEM_WIDTH + padding
                : VIEWPORT_ITEM_WIDTH * 2 + padding;
        const minOffset = 0 - (menuContainerRef.current?.offsetLeft ?? 0) + margin;
        const maxOffset = minOffset + windowWidth - viewportWidth;

        if (windowWidth < 768) {
            // if the screen is small don't offset the menu
            setOffset(minOffset + windowBuffer);
        } else if (trigger && value === itemValue) {
            const position = minOffset + trigger?.getBoundingClientRect().left;
            setOffset(
                Math.min(maxOffset - windowBuffer, Math.max(minOffset + windowBuffer, position))
            );
        } else if (!value) {
            setOffset(null);
        }
    };

    return sectionsAndGroups.length > 0 ? (
        <NavigationMenu.Root
            aria-label="Sections"
            id="sections"
            onValueChange={setValue}
            className="z-10 flex w-full flex-nowrap items-center"
        >
            <div
                ref={menuContainerRef}
                className="-mx-3"
                // className="-mb-4 pb-4" /* Positive padding / negative margin allows the navigation menu indicator to show in a scroll view */
            >
                <NavigationMenu.List className="center m-0 flex list-none gap-2 bg-transparent">
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
                                                onClick={(e) => {
                                                    if (value) {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }
                                                }}
                                            >
                                                <SectionGroupTab
                                                    isActive={isActive}
                                                    title={title}
                                                    icon={icon as IconName}
                                                />
                                            </NavigationMenu.Trigger>
                                            <NavigationMenu.Content className="absolute top-0 left-0 z-20 w-full motion-safe:data-[motion=from-end]:animate-enter-from-right motion-safe:data-[motion=from-start]:animate-enter-from-left motion-safe:data-[motion=to-end]:animate-exit-to-right motion-safe:data-[motion=to-start]:animate-exit-to-left md:w-max">
                                                <SectionGroupTileList
                                                    sections={sectionOrGroup.sections}
                                                    currentSection={currentSection}
                                                />
                                            </NavigationMenu.Content>
                                        </>
                                    ) : null
                                ) : (
                                    <NavigationMenu.Link asChild>
                                        <SectionTab
                                            url={sectionOrGroup.url}
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
                        className="fixed top-full z-50 flex h-3 items-end justify-center duration-150 motion-safe:transition-[width,transform] motion-safe:data-[state=hidden]:animate-fade-out motion-safe:data-[state=visible]:animate-fade-in"
                        aria-hidden
                    >
                        <div className="relative top-1/2 size-3 rotate-45 rounded-tl-sm border-tint-subtle border-t border-l bg-tint-base" />
                    </NavigationMenu.Indicator>
                </NavigationMenu.List>
            </div>
            <div
                className="absolute top-full flex transition-transform duration-200 ease-in-out"
                style={{
                    display: offset === null ? 'none' : undefined,
                    transform: offset ? `translateX(${offset}px) translateZ(0)` : 'translateZ(0)', // TranslateZ is needed to force a stacking context, fixing a rendering bug on Safari
                }}
            >
                <NavigationMenu.Viewport
                    className="relative mt-3 h-(--radix-navigation-menu-viewport-height) w-[calc(100vw-2rem)] origin-[top_center] overflow-hidden rounded-lg straight-corners:rounded-xs bg-tint-base depth-flat:shadow-none shadow-lg shadow-tint-10/6 ring-1 ring-tint-subtle duration-250 data-[state=closed]:duration-150 motion-safe:transition-[width,height,transform] motion-safe:data-[state=closed]:animate-scale-out motion-safe:data-[state=open]:animate-scale-in md:mx-0 md:w-(--radix-navigation-menu-viewport-width) dark:shadow-tint-1/6"
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
                'group relative my-2 flex select-none items-center justify-between circular-corners:rounded-full rounded-corners:rounded-xs px-3 py-1',
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
                'group relative my-2 flex select-none items-center justify-between circular-corners:rounded-full rounded-sm straight-corners:rounded-none px-3 py-1 transition-colors hover:cursor-default',
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
function SectionGroupTileList(props: {
    sections: ClientSiteSection[];
    currentSection: ClientSiteSection;
}) {
    const { sections, currentSection } = props;
    return (
        <ul
            className={tcls(
                'grid w-full gap-1 p-2 sm:grid-cols-1 md:w-max',
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
function SectionGroupTile(props: { section: ClientSiteSection; isActive: boolean }) {
    const { section, isActive } = props;
    const { url, icon, title } = section;
    return (
        <li className="flex w-full md:w-60">
            <Link
                href={url}
                className={tcls(
                    'flex w-full select-none flex-col gap-1 rounded-sm straight-corners:rounded-none px-3 py-2 transition-colors hover:bg-tint-hover',
                    isActive ? 'text-primary' : 'text-tint-strong'
                )}
            >
                <div className="flex w-full gap-2">
                    {icon ? (
                        <SectionIcon
                            className="mt-[3px]"
                            isActive={false}
                            icon={icon as IconName}
                        />
                    ) : null}
                    {title}
                </div>
                {section.description ? (
                    <p className="text-tint-subtle">{section.description}</p>
                ) : null}
            </Link>
        </li>
    );
}
