'use client';

import type { SiteSection, SiteSectionGroup } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';

import { Link } from '@/components/primitives';
import { SectionsList } from '@/lib/api';
import { tcls } from '@/lib/tailwind';

import { SectionIcon } from './SectionIcon';

const VIEWPORT_ITEM_WIDTH = 240; /* width of the tile (w-60) */

//TODO get section group working with vertical section list
//TODO tidy up the components!

/**
 * A set of navigational links representing site sections for multi-section sites
 */
export function SiteSectionTabs(props: { sections: SectionsList }) {
    const {
        sections: { list: sectionsAndGroups, section: currentSection },
    } = props;
    const [value, setValue] = React.useState<string | null>();
    const [offset, setOffset] = React.useState<number | null>(null);

    const onNodeUpdate = (
        trigger: HTMLButtonElement | null,
        itemValue: string,
        size: number = 0,
    ) => {
        const halfViewportWidth = (size === 1 ? VIEWPORT_ITEM_WIDTH : 2 * VIEWPORT_ITEM_WIDTH) / 2;
        const viewportFreeZone = 10 /* buffer */ + 8 /* padding */ + halfViewportWidth;
        const windowWidth = window.innerWidth;
        if (windowWidth < 768) {
            setOffset(0);
        } else if (trigger && value === itemValue) {
            const triggerOffsetRight = trigger.offsetLeft + trigger.offsetWidth / 2;
            setOffset(
                Math.min(
                    Math.max(viewportFreeZone, Math.round(triggerOffsetRight)),
                    windowWidth - viewportFreeZone,
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
            <div className="w-full hide-scroll overflow-x-scroll overflow-y-hidden pb-4 -mb-4" /* Positive padding / negative margin allows the navigation menu indicator to show in a scroll view */>
            <NavigationMenu.List className="center m-0 flex list-none bg-transparent px-1 sm:px-3 md:px-5 gap-2">
                {sectionsAndGroups.map((sectionOrGroup) => {
                    const { id, title, icon } = sectionOrGroup;
                    const isGroup = sectionOrGroup.object === 'site-section-group';
                    const isActiveGroup =
                        isGroup &&
                        Boolean(sectionOrGroup.sections.find((s) => s.id === currentSection.id));
                    const isActive = isActiveGroup || id === currentSection.id;
                    return (
                        <NavigationMenu.Item key={id} value={id}>
                            {isGroup ? (
                                <>
                                    <NavigationMenu.Trigger
                                        ref={(node) =>
                                            onNodeUpdate(node, id, sectionOrGroup.sections.length)
                                        }
                                        asChild
                                    >
                                        <button
                                            className={tcls(
                                                'relative group flex select-none items-center justify-between rounded straight-corners:rounded-none transition-colors px-3 py-1 my-2',
                                                isActive
                                                    ? 'text-primary dark:text-primary-400'
                                                    : 'text-dark/8 hover:bg-dark/1 hover:text-dark/9 dark:text-light/8 dark:hover:bg-light/2 dark:hover:text-light/9',
                                            )}
                                        >
                                            <span className="flex gap-2 items-center w-full truncate">
                                                {icon ? (
                                                    <SectionIcon
                                                        isActive={isActive}
                                                        icon={icon as IconName}
                                                    />
                                                ) : null}
                                                {title}
                                            </span>
                                            {isActive ? (
                                                <span className="inset-x-3 -bottom-2 h-0.5 absolute bg-primary dark:bg-primary-400" />
                                            ) : null}
                                            <Icon
                                                aria-hidden
                                                icon="chevron-down"
                                                className="shrink-0 size-3 opacity-6 ms-1 transition-all group-data-[state=open]:rotate-180"
                                            />
                                        </button>
                                    </NavigationMenu.Trigger>
                                    <NavigationMenu.Content className="absolute z-20 left-0 top-0 w-full md:w-max data-[motion=from-end]:motion-safe:animate-enterFromRight data-[motion=from-start]:motion-safe:animate-enterFromLeft data-[motion=to-end]:motion-safe:animate-exitToRight data-[motion=to-start]:motion-safe:animate-exitToLeft">
                                        <SectionGroupTileList
                                            sections={sectionOrGroup.sections as SiteSection[]}
                                            currentSection={currentSection}
                                        />
                                    </NavigationMenu.Content>
                                </>
                            ) : (
                                <NavigationMenu.Link asChild>
                                    <Link
                                        className={tcls(
                                            'relative group flex select-none items-center justify-between rounded straight-corners:rounded-none px-3 py-1 my-2',
                                            isActive
                                                ? 'text-primary dark:text-primary-400'
                                                : 'text-dark/8 hover:bg-dark/1 hover:text-dark/9 dark:text-light/8 dark:hover:bg-light/2 dark:hover:text-light/9',
                                        )}
                                        href={sectionOrGroup.urls.published ?? ''}
                                    >
                                        <span
                                            className={tcls(
                                                'flex gap-2 items-center w-full truncate',
                                            )}
                                        >
                                            {icon ? (
                                                <SectionIcon
                                                    isActive={isActive}
                                                    icon={icon as IconName}
                                                />
                                            ) : null}
                                            {title}
                                        </span>
                                        {isActive ? (
                                            <span className="inset-x-3 -bottom-2 h-0.5 absolute bg-primary dark:bg-primary-400" />
                                        ) : null}
                                    </Link>
                                </NavigationMenu.Link>
                            )}
                        </NavigationMenu.Item>
                    );
                })}
                <NavigationMenu.Indicator
                    className="top-full z-0 flex h-3 items-end justify-center motion-safe:transition-[width,_transform] data-[state=hidden]:motion-safe:animate-fadeOut data-[state=visible]:motion-safe:animate-fadeIn"
                    aria-hidden
                >
                    <div className="bg-light dark:bg-dark shadow-1xs shadow-dark/1 dark:shadow-dark/4 relative top-[70%] size-3 rotate-[225deg] rounded-tl-sm" />
                </NavigationMenu.Indicator>
            </NavigationMenu.List>
            </div>
            <div
                className="absolute mx-4 top-full flex transition-transform duration-200 ease-in-out"
                style={{
                    display: offset === null ? 'none' : undefined,
                    transform: offset ? `translateX(${offset}px)` : undefined,
                }}
            >
                <NavigationMenu.Viewport
                    className="bg-light dark:bg-dark rounded straight-corners:rounded-none shadow-1xs shadow-dark/1 dark:shadow-dark/4 relative mt-3 w-[calc(100vw_-_2rem)] md:w-[var(--radix-navigation-menu-viewport-width)] h-[var(--radix-navigation-menu-viewport-height)] origin-[top_center] overflow-hidden motion-safe:transition-[width,_height,_transform] duration-300 data-[state=closed]:motion-safe:animate-scaleOut data-[state=open]:motion-safe:animate-scaleIn"
                    style={{
                        translate: offset
                            ? '-50% 0'
                            : undefined /* don't move this to a Tailwind class as Radix renders viewport incorrectly for a few frames */,
                    }}
                />
            </div>
            </NavigationMenu.Root>
    ) : null;
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
                    'flex flex-col p-3 gap-2 rounded w-full min-h-12 select-none hover:bg-primary/1 focus:bg-primary/1 dark:hover:bg-primary/1 dark:focus:bg-primary/1',
                    isActive
                        ? 'text-primary dark:text-primary-400'
                        : 'text-dark/8 hover:text-dark/9 dark:text-light/8 dark:hover:text-light/9',
                )}
            >
                <div className="flex gap-2 items-center w-full font-medium light:text-dark dark:text-light">
                    {icon ? <SectionIcon isActive={false} icon={icon as IconName} /> : null}
                    <span className="truncate min-w-0">{title}</span>
                </div>
                <p className="text min-h-[2lh]">{/* TODO - add section description */}</p>
            </Link>
        </li>
    );
}
