'use client';

import type { IconName } from '@gitbook/icons';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';

import { Button, DropdownChevron, Link } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';
import { useIsMobile } from '../hooks/useIsMobile';
import { CONTAINER_STYLE } from '../layout';
import { SectionIcon } from './SectionIcon';
import type { ClientSiteSection, ClientSiteSections } from './encodeClientSiteSections';

const SCREEN_OFFSET = 16; // 1rem
const VIEWPORT_PADDING = 8; // 0.5rem
const MIN_ITEMS_FOR_COLS = 4; /* number of items to switch to 2 columns */
/**
 * A set of navigational links representing site sections for multi-section sites
 */
export function SiteSectionTabs(props: {
    sections: ClientSiteSections;
    className?: string;
    children?: React.ReactNode;
}) {
    const {
        sections: { list: sectionsAndGroups, current: currentSection },
        className,
        children,
    } = props;

    const currentTriggerRef = React.useRef<HTMLButtonElement | null>(null);
    const [offset, setOffset] = React.useState<number | null>(null);
    const [value, setValue] = React.useState<string | undefined>(undefined);

    const isMobile = useIsMobile(768);

    React.useEffect(() => {
        const trigger = currentTriggerRef.current;
        if (!trigger) {
            return;
        }

        const triggerWidth = trigger.getBoundingClientRect().width;
        const triggerLeft = trigger.getBoundingClientRect().left;
        setOffset(triggerLeft + triggerWidth / 2);
    });

    return sectionsAndGroups.length > 0 ? (
        <NavigationMenu.Root
            className={tcls(
                CONTAINER_STYLE,
                'relative z-10 flex w-full flex-nowrap items-end',
                'page-default-width:2xl:px-[calc((100%-1536px+4rem)/2)]',
                className
            )}
            value={value}
            onValueChange={setValue}
            skipDelayDuration={500}
        >
            <div
                className={tcls(
                    'md:-ml-8 -ml-4 sm:-ml-6 no-scrollbar relative flex grow list-none items-end overflow-x-auto pl-4 sm:pl-6 md:pl-8',
                    !children ? 'md:-mr-8 -mr-4 sm:-mr-6 pr-4 sm:pr-6 md:pr-8' : ''
                )}
            >
                <NavigationMenu.List
                    className="-mx-3 flex grow gap-2 bg-transparent"
                    aria-label="Sections"
                    id="sections"
                >
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
                            <NavigationMenu.Item key={id} value={id} id={id}>
                                {isGroup ? (
                                    sectionOrGroup.sections.length > 0 ? (
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
                                                style={{ padding: `${VIEWPORT_PADDING}px` }}
                                            >
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
                </NavigationMenu.List>
            </div>

            {children}

            <div
                className="absolute top-full left-0 z-20 flex w-full"
                style={{
                    padding: `0 ${SCREEN_OFFSET}px 0 ${SCREEN_OFFSET}px`,
                }}
            >
                <NavigationMenu.Viewport
                    className={tcls(
                        'relative origin-top overflow-hidden circular-corners:rounded-3xl rounded-corners:rounded-xl border border-tint bg-tint-base shadow-lg transition-transform duration-250 ease-in-out',
                        '-mt-0.5 w-full md:w-max',
                        'data-[state=closed]:animate-scale-out data-[state=open]:animate-scale-in',
                        "[&:not([style*='--radix-navigation-menu-viewport-width'])]:hidden" // The viewport width is only calculated once it's triggered, and can take a while. We hide the viewport until it's ready.
                    )}
                    style={{
                        translate:
                            !isMobile && offset
                                ? `clamp(0px, calc(${offset}px - ${SCREEN_OFFSET}px - 50%), calc(100vw - var(--radix-navigation-menu-viewport-width, 0px) - ${VIEWPORT_PADDING * 2}px - ${SCREEN_OFFSET * 2}px)) 0 0`
                                : '0 0 0', // TranslateZ is needed to force a stacking context, fixing a rendering bug on Safari
                        display: offset === null ? 'none' : undefined,
                    }}
                />
            </div>
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
            size="medium"
            variant="blank"
            {...rest}
            icon={icon ? <SectionIcon isActive={isActive} icon={icon} /> : null}
            label={title}
            trailing={isGroup ? <DropdownChevron /> : null}
            active={isActive}
            className={tcls(
                'group/dropdown relative my-2 overflow-visible px-3 py-1',
                isActive
                    ? 'after:contents-[] after:-bottom-2 bg-transparent text-primary-subtle after:absolute after:inset-x-3 after:h-0.5 after:bg-primary-9'
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
    sections: ClientSiteSection[];
    currentSection: ClientSiteSection;
}) {
    const { sections, currentSection } = props;
    return (
        <ul
            className={tcls(
                'grid w-full gap-1 sm:grid-cols-1 md:w-max',
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
