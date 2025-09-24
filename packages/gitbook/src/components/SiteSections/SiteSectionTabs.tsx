'use client';

import type { IconName } from '@gitbook/icons';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';

import { Button, DropdownChevron, Link } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';
import { findSectionInGroup } from '@/lib/utils';
import { useIsMobile } from '../hooks/useIsMobile';
import { CONTAINER_STYLE } from '../layout';
import { ScrollContainer } from '../primitives/ScrollContainer';
import { SectionIcon } from './SectionIcon';
import type {
    ClientSiteSection,
    ClientSiteSectionGroup,
    ClientSiteSections,
} from './encodeClientSiteSections';

const SCREEN_OFFSET = 16; // 1rem
const MAX_ITEMS_PER_COLUMN = 5; // number of items per column
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

    const currentTriggerRef = React.useRef<HTMLButtonElement | null>(null);
    const [offset, setOffset] = React.useState<number | null>(null);
    const [value, setValue] = React.useState<string | undefined>();

    const isMobile = useIsMobile(768);

    React.useEffect(() => {
        const trigger = currentTriggerRef.current;
        if (!value || !trigger) {
            return;
        }

        const triggerWidth = trigger.getBoundingClientRect().width;
        const triggerLeft = trigger.getBoundingClientRect().left;
        setOffset(triggerLeft + triggerWidth / 2);
    }, [value]);

    return structure.length > 0 ? (
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
            <ScrollContainer
                orientation="horizontal"
                className={tcls(
                    'grow',
                    'md:-ml-8 -ml-4 sm:-ml-6',
                    !children ? 'md:-mr-8 -mr-4 sm:-mr-6' : ''
                )}
                activeId={currentSection.id}
            >
                <NavigationMenu.List
                    className={tcls(
                        '-mx-3 flex grow gap-2 bg-transparent',
                        'pl-4 sm:pl-6 md:pl-8',
                        !children ? 'pr-4 sm:pr-6 md:pr-8' : ''
                    )}
                    aria-label="Sections"
                    id="sections"
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
                                        <NavigationMenu.Content>
                                            <SectionGroupTileList
                                                items={structureItem.children}
                                                currentSection={currentSection}
                                            />
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
                className="fixed top-full left-0 z-20 flex w-full"
                style={{
                    padding: `0 ${SCREEN_OFFSET}px 0 ${SCREEN_OFFSET}px`,
                }}
            >
                <NavigationMenu.Viewport
                    className={tcls(
                        'relative origin-top overflow-auto circular-corners:rounded-3xl rounded-corners:rounded-xl border border-tint bg-tint-base shadow-lg transition-transform duration-250 ease-in-out',
                        '-mt-0.5 w-full md:w-max',
                        'max-h-[calc(100vh-8rem)] data-[state=closed]:animate-scale-out data-[state=open]:animate-scale-in',
                        "[&:not([style*='--radix-navigation-menu-viewport-width'])]:hidden" // The viewport width is only calculated once it's triggered, and can take a while. We hide the viewport until it's ready.
                    )}
                    style={{
                        translate:
                            !isMobile && offset
                                ? `clamp(0px, calc(${offset}px - ${SCREEN_OFFSET}px - 50%), calc(100vw - var(--radix-navigation-menu-viewport-width, 0px) - ${SCREEN_OFFSET * 3}px)) 0 0`
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
    items: (ClientSiteSection | ClientSiteSectionGroup)[];
    currentSection: ClientSiteSection;
}) {
    const { items, currentSection } = props;

    // Separate non-grouped sections from grouped sections
    const sections = items.filter((item) => item.object === 'site-section');
    const groups = items.filter((item) => item.object === 'site-section-group');

    const hasSections = sections.length > 0;
    const hasGroups = groups.length > 0;

    return (
        <div className="flex flex-col md:flex-row">
            {/* Non-grouped sections */}
            {hasSections && (
                <ul
                    className={tcls(
                        'flex grid-flow-row flex-col gap-x-2 gap-y-1 p-2 md:grid',
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
                <ul
                    className={tcls(
                        'flex grid-flow-col flex-col items-start gap-x-2 gap-y-4 p-2 md:grid md:gap-y-1',
                        hasSections
                            ? 'border-tint-subtle bg-tint-subtle max-md:border-t md:border-l'
                            : ''
                    )}
                >
                    {groups.map((group) => (
                        <SectionGroupTile
                            key={group.id}
                            child={group}
                            currentSection={currentSection}
                        />
                    ))}
                </ul>
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
}) {
    const { child, currentSection } = props;

    if (child.object === 'site-section') {
        const { url, icon, title, description } = child;
        const isActive = child.id === currentSection.id;
        return (
            <li className="group/section-tile flex w-full shrink grow md:w-68">
                <Link
                    href={url}
                    className={tcls(
                        'grow circular-corners:rounded-2xl rounded-corners:rounded-lg px-3 py-2 transition-colors',
                        isActive
                            ? 'bg-primary-active text-primary-strong'
                            : 'text-tint-strong hover:bg-tint-hover'
                    )}
                >
                    <div className="mb-auto flex grow items-center gap-2">
                        {icon && (
                            <div
                                className={tcls(
                                    '-ml-1 self-start circular-corners:rounded-2xl rounded-corners:rounded-lg p-2 transition-colors',
                                    isActive
                                        ? 'bg-primary-base text-primary-subtle'
                                        : 'bg-tint text-tint-strong group-hover/section-tile:bg-tint-base'
                                )}
                            >
                                <SectionIcon isActive={isActive} icon={icon as IconName} />
                            </div>
                        )}
                        <div className="flex flex-col gap-1">
                            {title}
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
        <li className="flex w-full shrink grow flex-col gap-1">
            <div className="mt-3 mb-2 flex gap-2.5 px-3 font-semibold text-tint-subtle text-xs uppercase tracking-wider">
                {icon && (
                    <SectionIcon className="mt-0.5" isActive={false} icon={icon as IconName} />
                )}
                {title}
            </div>
            <ul
                className="flex grid-flow-row flex-col gap-x-2 gap-y-1 md:grid"
                style={{
                    gridTemplateColumns: `repeat(${Math.ceil(children.length / MAX_ITEMS_PER_COLUMN)}, minmax(0, 1fr))`,
                }}
            >
                {children.map((nestedChild) => (
                    <SectionGroupTile
                        key={nestedChild.id}
                        child={nestedChild}
                        currentSection={currentSection}
                    />
                ))}
            </ul>
        </li>
    );
}
