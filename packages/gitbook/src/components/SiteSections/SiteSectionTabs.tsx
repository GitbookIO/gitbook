'use client';

import type { SiteSection } from '@gitbook/api';
import type { IconName } from '@gitbook/icons';
import React from 'react';

import { SectionsList } from '@/lib/api';
import { tcls } from '@/lib/tailwind';

import { SectionIcon } from './SectionIcon';
import { Link } from '../primitives';

/**
 * A set of navigational tabs representing site sections for multi-section sites
 */
export function SiteSectionTabs(props: { sections: SectionsList }) {
    const {
        sections: { list: sections, index: currentIndex },
    } = props;

    const currentTabRef = React.useRef<HTMLAnchorElement>(null);
    const navRef = React.useRef<HTMLDivElement>(null);

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
                        return (
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
                            />
                        );
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
    { active: boolean; href: string; icon?: React.ReactNode; label: string }
>(function Tab(props, ref) {
    const { active, href, icon, label } = props;
    return (
        <Link
            className={tcls(
                'group/tab relative px-3 py-1 my-2 rounded straight-corners:rounded-none transition-colors',
                active && 'text-primary',
                !active &&
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
