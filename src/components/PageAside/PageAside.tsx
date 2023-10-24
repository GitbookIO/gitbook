import { getDocumentSections } from '@/lib/document';
import { tcls } from '@/lib/tailwind';
import { RevisionPageDocument } from '@gitbook/api';
import React from 'react';
import { ScrollSectionsList } from './ScrollSectionsList';

/**
 * Aside listing the headings in the document.
 */
export function PageAside(props: { page: RevisionPageDocument; document: any }) {
    const { document } = props;
    const sections = getDocumentSections(document);

    return (
        <aside
            className={tcls(
                'hidden',
                'xl:flex',
                'flex-col',
                'basis-56',
                'grow-0',
                'shrink-0',
                'sticky',
                'top-16',
                'h-[calc(100vh-4rem)]',
                'py-6',
            )}
        >
            {sections.length > 0 ? (
                <>
                    <div className={tcls('text-sm', 'text-slate-500', 'font-semibold', 'pb-3')}>
                        On this page
                    </div>
                    <div className={tcls('overflow-auto', 'flex-1')}>
                        <React.Suspense fallback={null}>
                            <ScrollSectionsList sections={sections} />
                        </React.Suspense>
                    </div>
                </>
            ) : null}
            <div></div>
        </aside>
    );
}
