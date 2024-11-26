'use client';
import { motion } from 'framer-motion';
import React from 'react';

import { useScrollActiveId } from '@/components/hooks';
import { DocumentSection } from '@/lib/document';
import { tcls } from '@/lib/tailwind';

import { AnimatedLine } from './AnimatedLine';
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
        <ul className={tcls('border-l', 'border-dark/2', 'dark:border-light/1', 'pl-1')}>
            {sections.map((section) => (
                <motion.li
                    key={section.id}
                    className={tcls('flex', 'flex-row', 'relative', 'h-fit')}
                >
                    {activeId === section.id ? <AnimatedLine transition={springCurve} /> : null}
                    <a
                        href={`#${section.id}`}
                        className={tcls(
                            'flex',
                            'flex-row',
                            'z-10',
                            'w-full',
                            'items-baseline',
                            'left-[-1px]',
                            'relative',
                            'text-sm',
                            'py-1',
                            'ps-3',
                            'pe-2',
                            'transition-all',
                            'duration-200',
                            section.depth > 1 ? ['ps-6', 'opacity-8'] : null,
                            activeId === section.id
                                ? [
                                      'text-primary',
                                      'dark:text-primary-400',
                                      '[&>span]:bg-primary-400',
                                      'dark:[&>span]:bg-primary-600',
                                      'dark:[&>span]:text-dark',
                                  ]
                                : [
                                      'text-neutral-500',
                                      'dark:text-neutral-400',
                                      'hover:text-neutral-900',
                                      'dark:hover:text-neutral-100',
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
