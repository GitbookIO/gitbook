'use client';

import Link from 'next/link';
import React from 'react';

import { IconChevronRight } from '@/components/icons/IconChevronRight';
import { DocumentSection } from '@/lib/document';
import { tcls } from '@/lib/tailwind';

import { HEADER_HEIGHT_DESKTOP } from '../layout';

/**
 * The threshold at which we consider a section as intersecting the viewport.
 */
const SECTION_INTERSECTING_THRESHOLD = 0.9;

export function ScrollSectionsList(props: { sections: DocumentSection[] }) {
    const { sections } = props;
    const [activeId, setActiveId] = React.useState<string | null>(null);
    const sectionsIntersectingMap = React.useRef<Map<string, boolean>>(new Map());

    React.useEffect(() => {
        const onObserve: IntersectionObserverCallback = (entries) => {
            /**
             * We need to keep track of all the sections that are intersecting
             * the viewport. This is because we want to find the first section
             * that is visible on the viewport.
             */
            entries.forEach((entry) => {
                const sectionId = entry.target.id;
                if (sectionId) {
                    sectionsIntersectingMap.current.set(
                        sectionId,
                        entry.isIntersecting &&
                            entry.intersectionRatio >= SECTION_INTERSECTING_THRESHOLD,
                    );
                }
            });

            /**
             * Find the first section that is intersecting the viewport (is visible)
             */
            const firstActiveSection = Array.from(sectionsIntersectingMap.current.entries()).find(
                ([, isIntersecting]) => isIntersecting,
            );

            if (firstActiveSection) {
                setActiveId(firstActiveSection[0]);
            }
        };

        const observer = new IntersectionObserver(onObserve, {
            rootMargin: `-${HEADER_HEIGHT_DESKTOP}px 0px -40% 0px`,
            threshold: SECTION_INTERSECTING_THRESHOLD,
        });

        sections.forEach((section) => {
            const headingElement = document.querySelector(`#${section.id}`);
            if (headingElement) {
                observer.observe(headingElement);
            }
        });

        return () => {
            observer.disconnect();
        };
    }, [sections]);

    return (
        <ul>
            {sections.map((section) => (
                <li key={section.id} className={tcls('flex', 'flex-row')}>
                    <Link
                        href={`#${section.id}`}
                        className={tcls(
                            'flex',
                            'flex-row',
                            'text-sm',
                            'hover:text-primary',
                            section.depth > 1 ? ['ps-3', 'py-1', 'opacity-8'] : ['py-2'],

                            activeId === section.id ? ['text-primary', 'font-bold'] : '',
                        )}
                    >
                        {section.depth > 1 ? (
                            <IconChevronRight
                                className={tcls('w-4', 'h-4', 'mr-1', 'mt-0.5', 'shrink-0')}
                            />
                        ) : null}
                        {section.title}
                    </Link>
                </li>
            ))}
        </ul>
    );
}
