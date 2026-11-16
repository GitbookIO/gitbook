'use client';
import React from 'react';

import { OpenAPIMethodBadge } from '@gitbook/react-openapi';

import { HEADER_HEIGHT_DESKTOP } from '../layout';
import { useUpdatesFilter } from '@/components/DocumentView/UpdatesFilter';
import { useScrollActiveId } from '@/components/hooks';
import { useBodyLoaded } from '@/components/primitives';
import type { DocumentSection } from '@/lib/document-sections';
import { UPDATES_TAG_SECTION_ATTR } from '@/lib/updates';

/**
 * The threshold at which we consider a section as intersecting the viewport.
 */
const SECTION_INTERSECTING_THRESHOLD = 0.9;

/**
 * The offset from the top of the page when scrolling to the active item.
 */
const ACTIVE_ITEM_OFFSET = 100;

export function ScrollSectionsList({ sections }: { sections: DocumentSection[] }) {
    const { selectedTagSet } = useUpdatesFilter();
    const ids = React.useMemo(
        () =>
            sections
                .filter(
                    (section) =>
                        selectedTagSet.size === 0 ||
                        section.tags === undefined ||
                        section.tags.some((tagSlug) => selectedTagSet.has(tagSlug))
                )
                .map(({ id }) => id),
        [sections, selectedTagSet]
    );

    const enabled = useBodyLoaded();

    const activeId = useScrollActiveId(ids, {
        rootMargin: `-${HEADER_HEIGHT_DESKTOP}px 0px -40% 0px`,
        threshold: SECTION_INTERSECTING_THRESHOLD,
        enabled,
    });

    const scrollContainerRef = React.useRef<HTMLUListElement>(null);
    const activeItemRef = React.useRef<HTMLLIElement>(null);

    React.useEffect(() => {
        if (activeId && activeItemRef.current && scrollContainerRef.current) {
            // The list's wrapper is the element that scrolls, not the list itself.
            scrollContainerRef.current.parentElement?.scrollTo({
                top: activeItemRef.current.offsetTop - ACTIVE_ITEM_OFFSET,
                behavior: 'smooth',
            });
        }
    }, [activeId]);

    return (
        <ul className="page-outline" ref={scrollContainerRef}>
            {sections.map((section) => (
                <li
                    key={section.id}
                    className="page-outline-item"
                    ref={activeId === section.id ? activeItemRef : null}
                    {...(section.tags !== undefined
                        ? { [UPDATES_TAG_SECTION_ATTR]: section.tags.join(' ') }
                        : {})}
                >
                    <a
                        href={`#${section.id}`}
                        aria-current={activeId === section.id ? 'true' : undefined}
                        data-cover-aware-text
                        className={
                            section.depth > 1 ? 'page-outline-link subitem' : 'page-outline-link'
                        }
                    >
                        {section.tag ? (
                            <OpenAPIMethodBadge
                                method={section.tag}
                                size="small"
                                className="-mt-0.5"
                                short
                            />
                        ) : null}

                        <span
                            className={section.deprecated ? 'page-outline-deprecated' : undefined}
                        >
                            {section.title}
                        </span>
                    </a>
                </li>
            ))}
        </ul>
    );
}
