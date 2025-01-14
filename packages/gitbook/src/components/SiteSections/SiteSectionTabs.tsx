'use client';

import type { SiteSection } from '@gitbook/api';
import type { IconName } from '@gitbook/icons';
import * as Popover from '@radix-ui/react-popover';
import React from 'react';

import { Link, PopoverArrow, PopoverContent } from '@/components/primitives';
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

    const currentTabRef = React.useRef<HTMLAnchorElement>(null);
    const navRef = React.useRef<HTMLDivElement>(null);

    const isGroup = true;
    return sections.length > 0 ? (
        <nav
            aria-label="Sections"
            ref={navRef}
            className="flex flex-nowrap items-center max-w-screen-2xl mx-auto page-full-width:max-w-full"
        >
            <div className="flex flex-col bg-transparent">
                {/* An element for the tabs which includes the page padding */}
                <div
                    role="tablist"
                    className={tcls(
                        'flex flex-row gap-2',
                        // Horizontal padding, which is the layout padding minus the padding of the tabs themselves.
                        'px-1',
                        'sm:px-3',
                        'md:px-5',
                    )}
                >
                    {sections.map((section, index) => {
                        const { id, urls, title, icon } = section;
                        const isActive = index === currentIndex;
                        return isGroup ? 
                            <SectionGroupTab
                                active={isActive}
                                key={id}
                                label={title}
                                ref={isActive ? currentTabRef : null}
                                icon={
                                    icon ? (
                                        <SectionIcon isActive={isActive} icon={icon as IconName} />
                                    ) : null
                                }
                                sections={sections} /> :
                            <Tab
                                active={isActive}
                                key={id}
                                label={title}
                                href={urls.published ?? ''}
                                ref={isActive ? currentTabRef : null}
                                icon={
                                    icon ? (
                                        <SectionIcon isActive={isActive} icon={icon as IconName} />
                                    ) : null
                                }
                            />;
                    })}
                </div>
            </div>
        </nav>
    ) : null;
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
                active && 'text-primary',
                !active && 'text-tint hover:bg-tint-hover hover:text-tint-strong',
            )}
            role="tab"
            href={href}
        >
            <span ref={ref} className={tcls('flex gap-2 items-center w-full truncate')}>
                {icon}
                {label}
            </span>
            {active && <span className="inset-x-3 -bottom-2 h-0.5 absolute bg-primary-11" />}
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
    return <ul className="flex flex-row flex-wrap max-w-[30rem]">{sections.map(section => (<SectionTile key={section.id} section={section} />))}</ul>;
}

const SectionTile = (props: { section: SiteSection }) => {
    const { section } = props;
    const { urls, icon, title } = section;
    return <li className='flex w-60'><Link href={urls.published ?? ''} className="flex flex-col p-3 gap-2 rounded w-full min-h-12 hover:bg-slate-50 focus:bg-slate-50 select-none">
        <span className={tcls('flex gap-2 items-center w-full truncate')}>
            {icon ? (
                <SectionIcon isActive={false} icon={icon as IconName} />
            ) : null}
            {title}
        </span>
        <p className='text min-h-[2lh]'>Manage your projects from your browser.</p>
    </Link></li>;
    }
