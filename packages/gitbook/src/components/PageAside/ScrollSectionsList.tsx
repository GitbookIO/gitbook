'use client';
import React from 'react';

import { useScrollActiveId } from '@/components/hooks';
import type { DocumentSection } from '@/lib/document-sections';
import { tcls } from '@/lib/tailwind';

import { useBodyLoaded } from '@/components/primitives';
import { HEADER_HEIGHT_DESKTOP } from '../layout';
import { AsideSectionHighlight } from './AsideSectionHighlight';

/**
 * The threshold at which we consider a section as intersecting the viewport.
 */
const SECTION_INTERSECTING_THRESHOLD = 0.9;

/**
 * The offset from the top of the page when scrolling to the active item.
 */
const ACTIVE_ITEM_OFFSET = 100;

export function ScrollSectionsList({ sections }: { sections: DocumentSection[] }) {
    const ids = React.useMemo(() => sections.map(({ id }) => id), [sections]);

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
            scrollContainerRef.current?.scrollTo({
                top: activeItemRef.current.offsetTop - ACTIVE_ITEM_OFFSET,
                behavior: 'smooth',
            });
        }
    }, [activeId]);

    return (
        <ul
            className="relative flex flex-col overflow-y-auto border-tint-subtle sidebar-list-line:border-l pb-5 xl:max-2xl:page-api-block:mt-0 xl:max-2xl:page-api-block:p-2"
            ref={scrollContainerRef}
        >
            {sections.map((section) => (
                <li
                    key={section.id}
                    className={tcls(
                        'flex',
                        'flex-row',
                        'relative',
                        'h-fit',
                        'mt-2',
                        'first:mt-0',
                        'mb-0.5',
                        section.depth > 1 && ['ml-3', 'my-0', 'sidebar-list-line:ml-0']
                    )}
                    ref={activeId === section.id ? activeItemRef : null}
                >
                    {activeId === section.id && (
                        <AsideSectionHighlight
                            className={tcls(
                                'sidebar-list-default:hidden',
                                section?.depth > 1
                                    ? [
                                          'sidebar-list-default:rounded-l-none',
                                          'sidebar-list-line:rounded-l-none',
                                      ]
                                    : [
                                          'sidebar-list-default:ml-3',
                                          'contrast-more:sidebar-list-default:ml-0',
                                      ]
                            )}
                        />
                    )}
                    <a
                        href={`#${section.id}`}
                        className={tcls(
                            'relative',
                            'z-10',
                            'text-sm',

                            'w-full',
                            'py-1',
                            'px-3',

                            'transition-all',
                            'duration-200',

                            'rounded-md',
                            'straight-corners:rounded-none',
                            'circular-corners:rounded-2xl',
                            'sidebar-list-line:rounded-l-none!',

                            'hover:bg-tint-hover',
                            'theme-gradient:hover:bg-tint-12/1',
                            'hover:text-tint-strong',
                            'contrast-more:hover:ring-1',
                            'contrast-more:hover:ring-inset',
                            'contrast-more:hover:ring-current',

                            section.depth > 1 && [
                                'subitem',
                                'sidebar-list-line:pl-6',
                                'opacity-8',
                                'contrast-more:opacity-11',

                                'sidebar-list-default:rounded-l-none!',
                                'sidebar-list-default:border-l',
                                'sidebar-list-default:border-tint',
                            ],

                            activeId === section.id && [
                                'text-primary-subtle',
                                'hover:text-primary',
                                'contrast-more:text-primary',
                                'contrast-more:hover:text-primary-strong',
                                'sidebar-list-line:ml-px',

                                'hover:bg-primary-hover',
                                'theme-muted:hover:bg-primary-active',
                                '[html.sidebar-filled.theme-bold.tint_&]:hover:bg-primary-active',
                                'theme-gradient:hover:bg-primary-active',

                                'tint:font-semibold',
                                'contrast-more:font-semibold',

                                'sidebar-list-default:border-tint',
                            ]
                        )}
                    >
                        {section.tag ? (
                            <span
                                className={`-mt-0.5 openapi-method text-xs! openapi-method-${section.tag.toLowerCase()}`}
                            >
                                {section.tag}
                            </span>
                        ) : null}

                        <span
                            className={tcls(
                                section.deprecated && [
                                    'line-through',
                                    'opacity-50',
                                    'contrast-more:opacity-60',
                                ]
                            )}
                        >
                            {section.title}
                        </span>
                    </a>
                </li>
            ))}
        </ul>
    );
}
