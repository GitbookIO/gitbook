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
        <ul className={tcls('sidebar-list-line:border-l', 'border-dark/2', 'dark:border-light/1')}>
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

                            'hover:bg-dark/1',
                            'dark:hover:bg-light/1',
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
                                'sidebar-list-default:border-dark/3',
                                'dark:sidebar-list-default:border-light/3',
                            ],

                            activeId === section.id && [
                                'text-tint',
                                'hover:text-tint',
                                'dark:text-tint-400',
                                'dark:hover:text-tint-400',

                                'contrast-more:font-semibold',

                                'sidebar-list-default:border-tint',

                                'hover:bg-tint/3',
                                'dark:hover:bg-tint-400/3',
                                'sidebar-list-pill:hover:bg-transparent',
                                'dark:sidebar-list-pill:hover:bg-transparent',
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

                        {section.title}
                    </a>
                </motion.li>
            ))}
        </ul>
    );
}
