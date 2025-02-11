'use client';
import { motion } from 'framer-motion';
import React from 'react';

import { useScrollActiveId } from '@/components/hooks';
import type { DocumentSection } from '@/lib/document-sections';
import { tcls } from '@/lib/tailwind';

import { AsideSectionHighlight } from './AsideSectionHighlight';
import { HEADER_HEIGHT_DESKTOP } from '../layout';

/**
 * The threshold at which we consider a section as intersecting the viewport.
 */
const SECTION_INTERSECTING_THRESHOLD = 0.9;

const springCurve = {
    type: 'spring',
    stiffness: 700,
    damping: 50,
    mass: 0.8,
};

export function ScrollSectionsList(props: { sections: DocumentSection[] }) {
    const { sections } = props;

    const ids = React.useMemo(() => {
        return sections.map((section) => {
            return section.id;
        });
    }, [sections]);

    const activeId = useScrollActiveId(ids, {
        rootMargin: `-${HEADER_HEIGHT_DESKTOP}px 0px -40% 0px`,
        threshold: SECTION_INTERSECTING_THRESHOLD,
    });

    return (
        <ul className={tcls('sidebar-list-line:border-l', 'border-tint-subtle')}>
            {sections.map((section) => (
                <motion.li
                    key={section.id}
                    className={tcls(
                        'flex',
                        'flex-row',
                        'relative',
                        'h-fit',
                        'mt-2',
                        section.depth > 1 && ['ml-3', 'my-0', 'sidebar-list-line:ml-0'],
                    )}
                >
                    {activeId === section.id ? (
                        <AsideSectionHighlight
                            transition={springCurve}
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
                                      ],
                            )}
                        />
                    ) : null}
                    <a
                        href={`#${section.id}`}
                        className={tcls(
                            'relative',
                            'flex',
                            'flex-row',
                            'items-baseline',
                            'z-10',
                            'text-sm',

                            'w-full',
                            'py-1',
                            'px-3',

                            'transition-all',
                            'duration-200',

                            'rounded-md',
                            'straight-corners:rounded-none',
                            'sidebar-list-line:rounded-l-none',

                            'hover:bg-tint-hover',
                            'hover:text-tint-strong',
                            'contrast-more:hover:ring-1',
                            'contrast-more:hover:ring-inset',
                            'contrast-more:hover:ring-current',

                            section.depth > 1 && [
                                'subitem',
                                'sidebar-list-line:pl-6',
                                'opacity-8',
                                'contrast-more:opacity-11',

                                'sidebar-list-default:rounded-l-none',
                                'sidebar-list-default:border-l',
                                'sidebar-list-default:border-tint',
                            ],

                            activeId === section.id && [
                                'text-primary-subtle',
                                'hover:text-primary',
                                'contrast-more:text-primary',
                                'contrast-more:hover:text-primary-strong',
                                'hover:bg-primary-hover',
                                'tint:font-semibold',
                                'contrast-more:font-semibold',

                                'sidebar-list-default:border-tint',
                                'sidebar-list-pill:hover:bg-primary-hover',
                                '[html.sidebar-list-pill.theme-muted_&]:bg-primary-hover',
                                '[html.sidebar-list-pill.theme-bold.tint_&]:bg-primary-hover',
                            ],
                        )}
                    >
                        {section.tag ? (
                            <span
                                className={`openapi-method openapi-method-${section.tag.toLowerCase()}`}
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
                                ],
                            )}
                        >
                            {section.title}
                        </span>
                    </a>
                </motion.li>
            ))}
        </ul>
    );
}
