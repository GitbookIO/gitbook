'use client';

import Link from 'next/link';
import React from 'react';

import { IconChevronRight } from '@/components/icons/IconChevronRight';
import { DocumentSection } from '@/lib/document';
import { tcls } from '@/lib/tailwind';

export function ScrollSectionsList(props: { sections: DocumentSection[] }) {
    const { sections } = props;
    const [activeId, setActiveId] = React.useState(null);

    React.useEffect(() => {
        //
    }, []);

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
                            section.depth > 1
                                ? ['font-light', 'ps-3', 'py-1', 'text-slate-500']
                                : ['py-2', 'text-slate-700'],

                            activeId === section.id ? 'text-primary-500' : 'hover:text-slate-900',
                        )}
                    >
                        {section.depth > 1 ? (
                            <IconChevronRight className={tcls('w-4', 'h-4', 'mr-1', 'mt-0.5')} />
                        ) : null}
                        {section.title}
                    </Link>
                </li>
            ))}
        </ul>
    );
}
