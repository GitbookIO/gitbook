'use client';

import type { SiteSection } from '@gitbook/api';
import type { IconName } from '@gitbook/icons';
import React from 'react';

import { tcls } from '@/lib/tailwind';

import { Link } from '../primitives';
import { SectionIcon } from './SectionIcon';

/**
 * A list of items representing site sections for multi-section sites
 */
export function SiteSectionList(props: {
    list: SiteSection[];
    section: SiteSection;
    index: number;
}) {
    const { list: sections, index: currentIndex } = props;

    return (
        sections.length > 0 && (
            <nav
                aria-label="Sections"
                className={tcls(
                    'text-dark/8',
                    'dark:text-light/8',
                    'border-b',
                    'border-dark/2',
                    'dark:border-light/2',
                    'pb-6',
                )}
            >
                <ul className={tcls('space-y-4')}>
                    {sections.map((section, index) => {
                        const isActive = index === currentIndex;
                        return (
                            <li
                                key={section.id}
                                className={tcls(
                                    isActive && 'text-primary',
                                    'dark:text-primary-400',
                                )}
                            >
                                <Link
                                    href={section.urls.published ?? ''}
                                    className={tcls('flex', 'flex-row', 'items-center', 'gap-3')}
                                >
                                    <div
                                        className={tcls(
                                            'size-8',
                                            'flex',
                                            'items-center',
                                            'justify-center',
                                            'bg-light-1',
                                            'shadow-sm',
                                            'shadow-dark/4',
                                        )}
                                    >
                                        {section.title.substring(0, 2)}
                                    </div>
                                    {section.title}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
                {
                    //     <div className="flex flex-col bg-transparent">
                    //         {/* An element for the tabs which includes the page padding */}
                    //         <div
                    //             role="tablist"
                    //             className={tcls(
                    //                 'flex flex-row gap-2',
                    //                 // Horizontal padding, which is the layout padding minus the padding of the tabs themselves.
                    //                 'px-1',
                    //                 'sm:px-3',
                    //                 'md:px-5',
                    //             )}
                    //         >
                    //             {sections.map((section, index) => {
                    //                 const { id, urls, title, icon } = section;
                    //                 const isActive = index === currentIndex;
                    //                 return (
                    //                     <Tab
                    //                         active={isActive}
                    //                         key={id}
                    //                         label={title}
                    //                         href={urls.published ?? ''}
                    //                         ref={isActive ? currentTabRef : null}
                    //                         icon={
                    //                             icon ? (
                    //                                 <SectionIcon isActive={isActive} icon={icon as IconName} />
                    //                             ) : null
                    //                         }
                    //                     />
                    //                 );
                    //             })}
                    //         </div>
                    //         {/* A container for a pseudo element for active tab indicator. A container is needed so we can set
                    //             a relative position without breaking the z-index of other parts of the header. */}
                    //         <div
                    //             className={tcls(
                    //                 'flex',
                    //                 'relative',
                    //                 'after:block',
                    //                 "after:content-['']",
                    //                 'after:origin-left',
                    //                 'after:absolute',
                    //                 'after:-bottom-px',
                    //                 'after:left-0',
                    //                 'after:opacity-[--tab-opacity]',
                    //                 'after:scale-x-[--tab-scale]',
                    //                 'after:[transition:_opacity_150ms_25ms,transform_150ms]',
                    //                 'after:motion-reduce:transition-none',
                    //                 'after:translate-x-[var(--tab-start)]',
                    //                 'after:will-change-transform',
                    //                 'after:h-0.5',
                    //                 'after:mb-px',
                    //                 'after:w-[100px]',
                    //                 'after:bg-primary',
                    //                 'dark:after:bg-primary-400',
                    //             )}
                    //         />
                    //     </div>
                }
            </nav>
        )
    );
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
                'group/tab px-3 py-1 my-2 rounded straight-corners:rounded-none transition-colors',
                active && 'text-primary dark:text-primary-400',
                !active &&
                    'text-dark/8 hover:bg-dark/1 hover:text-dark/9 dark:text-light/8 dark:hover:bg-light/2 dark:hover:text-light/9',
            )}
            role="tab"
            href={href}
        >
            <span ref={ref} className={tcls('flex gap-2 items-center w-full truncate')}>
                {icon}
                {label}
            </span>
        </Link>
    );
});
