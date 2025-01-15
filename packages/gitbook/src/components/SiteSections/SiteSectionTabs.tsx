'use client';

import type { SiteSection } from '@gitbook/api';
import type { IconName } from '@gitbook/icons';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';

import { Link } from '@/components/primitives';
import { SectionsList } from '@/lib/api';
import { tcls } from '@/lib/tailwind';

import { SectionIcon } from './SectionIcon';

/**
 * A set of navigational tabs representing site sections for multi-section sites
 */
export function SiteSectionTabs(props: { sections: SectionsList }) {
    const {
        sections: { list: sections, index: currentIndex },
    } = props;
    const [value, setValue] = React.useState<string | null>();
    const [offset, setOffset] = React.useState<number | null>(null);

    const onNodeUpdate = (trigger: any, itemValue: any) => {
        // TODO we need to know size of the menu viewport width
        const viewportWidth = 260;
        const windowWidth = window.innerWidth;
        if (trigger && value === itemValue) {
            const triggerOffsetRight = trigger.offsetLeft + trigger.offsetWidth / 2;
            setOffset(Math.min((Math.max(viewportWidth, Math.round(triggerOffsetRight))), windowWidth - viewportWidth));
        } else if (!value) {
            setOffset(null);
        }
        return trigger;
    };

    return sections.length > 0 ? (
        <NavigationMenu.Root
            aria-label="Sections"
            onValueChange={setValue}
            className="relative z-10 flex flex-nowrap items-center max-w-screen-2xl mx-auto page-full-width:max-w-full"
        >
            <NavigationMenu.List className="center m-0 flex list-none bg-transparent px-1 sm:px-3 md:px-5">
                {sections.map((section, index) => {
                    const { id, urls, title, icon } = section;
                    const isGroup = index === 0 || index === 1 || index === 2 || index === sections.length - 1; //false; //
                    const isActive = index === currentIndex;
                    return (
                        <NavigationMenu.Item key={id} value={id}>
                            {isGroup ? (
                                <>
                                    <NavigationMenu.Trigger
                                        ref={(node) => onNodeUpdate(node, id)}
                                        asChild
                                    >
                                        <button className={tcls('relative group flex select-none items-center justify-between rounded straight-corners:rounded-none transition-colors px-3 py-2 my-2 font-medium', 
                                            isActive ? 'text-primary dark:text-primary-400' : 'text-dark/8 hover:bg-dark/1 hover:text-dark/9 dark:text-light/8 dark:hover:bg-light/2 dark:hover:text-light/9')}>
                                         <span className={tcls('flex gap-2 items-center w-full truncate')}>
                                            {icon ? (
                                                <SectionIcon isActive={isActive} icon={icon as IconName} />
                                            ) : null}
                                            {title}
                                        </span>
                                        {isActive ? (
                                            <span className="inset-x-3 -bottom-2 h-0.5 absolute bg-primary dark:bg-primary-400" /> 
                                        ) : null}
                                        </button>
                                    </NavigationMenu.Trigger>
                                    <NavigationMenu.Content className="absolute z-20 left-0 top-0 w-max data-[motion=from-end]:motion-safe:animate-enterFromRight data-[motion=from-start]:motion-safe:animate-enterFromLeft data-[motion=to-end]:motion-safe:animate-exitToRight data-[motion=to-start]:motion-safe:animate-exitToLeft">
                                        <SectionTileList sections={sections.slice(0, index === 0 ? 1 : index + 1
                                        )} />
                                    </NavigationMenu.Content>
                                </>
                            ) : (
                                <NavigationMenu.Link asChild>
                                    <Link className={tcls('relative group flex select-none items-center justify-between rounded px-3 py-2 my-2 text-[15px]', 
                                        isActive ? 'text-primary dark:text-primary-400' : 'text-dark/8 hover:bg-dark/1 hover:text-dark/9 dark:text-light/8 dark:hover:bg-light/2 dark:hover:text-light/9')} href={urls.published ?? ''} >
                                        <span className={tcls('flex gap-2 items-center w-full truncate')}>
                                            {icon ? (
                                                <SectionIcon isActive={isActive} icon={icon as IconName} />
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
                    <div className="bg-light shadow-1xs shadow-dark/1 dark:bg-dark dark:shadow-dark/4 relative top-[70%] size-3 rotate-[225deg] rounded-tl-sm" />
                </NavigationMenu.Indicator>
            </NavigationMenu.List>
            <div
                className="absolute left-0 top-full flex"
                style={{
                    display: !offset ? 'none' : undefined,
                    transform: `translateX(${offset}px)`,
                    transition: 'transform 0.25s ease',
                }}
            >
                <NavigationMenu.Viewport
                    className="bg-light shadow-1xs shadow-dark/1 dark:bg-dark dark:shadow-dark/4 relative mt-3 h-[var(--radix-navigation-menu-viewport-height)] origin-[top_center] overflow-hidden rounded-md motion-safe:transition-[width,_height,_transform] duration-300 data-[state=closed]:motion-safe:animate-scaleOut data-[state=open]:motion-safe:animate-scaleIn sm:w-[var(--radix-navigation-menu-viewport-width)]"
                    style={{ translate: '-50% 0' }}
                />
            </div>
            </NavigationMenu.Root>
    ) : 
    null;
}

/**
 * The tab item - a link to a site section
 */
const Tab = React.forwardRef<
    HTMLSpanElement,
    { active: boolean; href: string; icon?: React.ReactNode; label: string } & React.HTMLAttributes<HTMLAnchorElement>
>(function Tab(props, ref) {
    const { active, href, icon, label, ...domProps } = props;
    return (
        <Link
            {...domProps}
            className={tcls(
                'group/tab relative px-3 py-1 my-2 rounded straight-corners:rounded-none transition-colors',
                active ? 'text-primary' : 
                    'text-tint hover:bg-tint-hover hover:text-tint-strong',
            )}
            role="tab"
            href={href}
        >
            <span ref={ref} className={tcls('flex gap-2 items-center w-full truncate')}>
                {icon}
                {label}
            </span>
            {active && (
                <span className="inset-x-3 -bottom-2 h-0.5 absolute bg-primary-11" />
            )}
        </Link>
    );
});

const SectionGroupTab = React.forwardRef<
HTMLSpanElement,
{ active: boolean; icon?: React.ReactNode; label: string; sections: SiteSection[] } & React.HTMLAttributes<HTMLAnchorElement>
>(function SectionGroupTab(props, ref) {
    const { sections, ...tabProps } = props;
    const [open, setOpen] = React.useState(false);
return (
    <Popover.Root open={open} onOpenChange={setOpen} >
        <Popover.Trigger asChild>
           <button onMouseEnter={e => setOpen(true)} onMouseLeave={e => setOpen(false)}>{tabProps.label}</button>
        </Popover.Trigger>
        <Popover.Portal>
            <PopoverContent className='p-2 data-[state=open]:motion-safe:animate-[fadeIn_350ms_forwards]'>
                <SectionTileList sections={sections} />
                <PopoverArrow />
            </PopoverContent>
        </Popover.Portal>
    </Popover.Root>
);
});

const SectionTileList = (props: { sections: SiteSection[] }) => {
    const { sections } = props;
    return (
        <ul className={tcls("grid w-max p-2 shadow-1xs shadow-dark/1 dark:bg-dark dark:shadow-dark/4", sections.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
            {sections.map((section) => (
                <SectionTile key={section.id} section={section} />
            ))}
        </ul>
    );
};

const SectionTile = (props: { section: SiteSection }) => {
    const { section } = props;
    const { urls, icon, title } = section;
    return (
        <li className="flex w-60">
            <Link
                href={urls.published ?? ''}
                className="flex flex-col p-3 gap-2 rounded w-full min-h-12 hover:bg-slate-50 focus:bg-slate-50 select-none"
            >
                <span className={tcls('flex gap-2 items-center w-full truncate')}>
                    {icon ? <SectionIcon isActive={false} icon={icon as IconName} /> : null}
                    {title}
                </span>
                <p className="text min-h-[2lh]">Manage your projects from your browser.</p>
            </Link>
        </li>
    );
};
