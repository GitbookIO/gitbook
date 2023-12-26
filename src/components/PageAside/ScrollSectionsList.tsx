'use client';

import Link from 'next/link';
import React from 'react';

import { useScrollActiveId } from '@/components/hooks';
import { DocumentSection } from '@/lib/document';
import { tcls } from '@/lib/tailwind';

import { HEADER_HEIGHT_DESKTOP } from '../layout';

/**
 * The threshold at which we consider a section as intersecting the viewport.
 */
const SECTION_INTERSECTING_THRESHOLD = 0.9;

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
        <ul className={tcls('border-l', 'border-dark/2', 'dark:border-light/1', 'space-y-1')}>
            {sections.map((section) => (
                <li key={section.id} className={tcls('flex', 'flex-row')}>
                    <Link
                        href={`#${section.id}`}
                        className={tcls(
                            'flex',
                            'flex-row',
                            'left-[-1px]',
                            'relative',
                            'text-sm',
                            'py-1',
                            'ps-3',
                            'hover:text-primary',
                            'transition-colors',
                            'duration-200',
                            'border-l',
                            'border-transparent',
                            section.depth > 1 ? ['ps-6', 'opacity-8'] : null,
                            activeId === section.id
                                ? [
                                      'text-primary',
                                      'border-primary',
                                      'dark:text-primary-400',
                                      'dark:border-primary-400',
                                  ]
                                : '',
                        )}
                    >
                        {section.title}
                    </Link>
                </li>
            ))}
        </ul>
    );
}
