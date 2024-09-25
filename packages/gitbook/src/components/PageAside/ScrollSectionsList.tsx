'use client';
import { motion, useReducedMotion } from 'framer-motion';
import React from 'react';

import { useScrollActiveId } from '@/components/hooks';
import { DocumentSection } from '@/lib/document';
import { tcls } from '@/lib/tailwind';

import { AnimatedBackground } from './AnimatedBackground';
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
    const [hoveredId, setHoveredId] = React.useState<null | string>(null);

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
        <ul className={tcls('border-l', 'border-dark/2', 'dark:border-light/1')}>
            {sections.map((section) => (
                <motion.li
                    key={section.id}
                    className={tcls('flex', 'flex-row', 'relative', 'h-fit')}
                    onMouseEnter={() => setHoveredId(section.id)}
                    onMouseLeave={() => setHoveredId(activeId)}
                >
                    {activeId === section.id ? <AnimatedLine transition={springCurve} /> : null}
                    {activeId === section.id || hoveredId === section.id ? (
                        <AnimatedBackground transition={springCurve} />
                    ) : null}
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
                            section.depth > 1 ? ['ps-6', 'opacity-8'] : null,
                            activeId === section.id
                                ? [
                                      'text-primary',
                                      'dark:text-primary-400',
                                      'opacity-[1]',
                                      '[&>span]:bg-primary-400',
                                      'dark:[&>span]:bg-primary-600',
                                      'dark:[&>span]:text-dark',
                                  ]
                                : '',
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
