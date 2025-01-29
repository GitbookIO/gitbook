'use client';

import type { SiteSection } from '@gitbook/api';
import { type IconName } from '@gitbook/icons';
import React from 'react';

import { SectionsList } from '@/lib/api';
import { ClassValue, tcls } from '@/lib/tailwind';

import { Link } from '../primitives';
import { SectionIcon } from './SectionIcon';
import { useIsMounted } from '../hooks';
import { TOCScrollContainer, useScrollToActiveTOCItem } from '../TableOfContents/TOCScroller';

const MAX_ITEMS = 5; // If there are more sections than this, they'll be shown below the fold in a scrollview.

/**
 * A list of items representing site sections for multi-section sites
 */
export function SiteSectionList(props: { sections: SectionsList; className: ClassValue }) {
    const {
        sections: { list: sections, index: currentIndex },
        className,
    } = props;

    return (
        sections.length > 0 && (
            <nav
                aria-label="Sections"
                className={tcls(
                    `text-gray text-sm
                    border-b border-gray-subtle -mx-5 relative
                    before:absolute before:contents[] before:left-0 before:right-2 before:bottom-0 before:h-12 before:pointer-events-none 
                    before:bg-gradient-to-b from-transparent to-gray-base`, // TODO @Zeno: Bring back sidebar styles here...
                    className,
                )}
            >
                <TOCScrollContainer
                    style={{ maxHeight: `${MAX_ITEMS * 3 + 2}rem` }}
                    className="overflow-y-auto px-2 pb-6 gutter-stable"
                >
                    {sections.map((section, index) => (
                        <SiteSectionListItem
                            section={section}
                            isActive={index === currentIndex}
                            key={section.id}
                        />
                    ))}
                </TOCScrollContainer>
            </nav>
        )
    );
}

export function SiteSectionListItem(props: { section: SiteSection; isActive: boolean }) {
    const { section, isActive, ...otherProps } = props;

    const isMounted = useIsMounted();
    React.useEffect(() => {}, [isMounted]); // This updates the useScrollToActiveTOCItem hook once we're mounted, so we can actually scroll to the this item

    const linkRef = React.createRef<HTMLAnchorElement>();
    useScrollToActiveTOCItem({ linkRef, isActive });

    return (
        <Link
            href={section.urls.published ?? ''}
            ref={linkRef}
            aria-current={isActive && 'page'}
            className={`flex flex-row items-center gap-3 px-3 py-2
            hover:bg-gray-hover contrast-more:hover:ring-1 contrast-more:hover:ring-gray
            hover:text-gray-strong
            rounded-md straight-corners:rounded-none transition-all group/section-link 
            ${
                isActive
                    ? `text-primary hover:text-primary-strong contrast-more:text-primary-strong contrast-more:font-semibold
                hover:bg-primary-hover contrast-more:hover:ring-1 contrast-more:hover:ring-primary-hover`
                    : null
            }`}
            {...otherProps}
        >
            <div
                className={tcls(
                    `size-8 flex items-center justify-center
                    bg-gray-subtle shadow-sm shadow-gray
                    dark:shadow-none rounded-md straight-corners:rounded-none leading-none
                    ring-1 ring-gray-subtle
                    text-gray contrast-more:text-gray-strong
                    group-hover/section-link:scale-110 group-active/section-link:scale-90 group-active/section-link:shadow-none
                    transition-transform text-lg`,
                    isActive
                        ? `bg-primary-subtle ring-primary-subtle
                        shadow-md shadow-primary
                        contrast-more:ring-2 contrast-more:ring-primary
                        text-primary contrast-more:text-primary-strong`
                        : null,
                )}
            >
                {section.icon ? (
                    <SectionIcon icon={section.icon as IconName} isActive={isActive} />
                ) : (
                    <span className={`opacity-8 text-sm ${isActive && 'opacity-10'}`}>
                        {section.title.substring(0, 2)}
                    </span>
                )}
            </div>
            {section.title}
        </Link>
    );
}
