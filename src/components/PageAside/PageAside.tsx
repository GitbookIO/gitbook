import { CustomizationSettings, JSONDocument, RevisionPageDocument, Space } from '@gitbook/api';
import React from 'react';

import { t, getSpaceLanguage } from '@/intl/server';
import { getDocumentSections } from '@/lib/document';
import { tcls } from '@/lib/tailwind';

import { ScrollSectionsList } from './ScrollSectionsList';
import { PageFeedbackForm } from '../PageFeedback';

/**
 * Aside listing the headings in the document.
 */
export function PageAside(props: {
    space: Space;
    customization: CustomizationSettings;
    page: RevisionPageDocument;
    document: JSONDocument | null;
    withHeaderOffset: boolean;
    withFullPageCover: boolean;
    withPageFeedback: boolean;
}) {
    const { space, page, customization, document, withHeaderOffset, withPageFeedback } = props;
    const sections = document ? getDocumentSections(document) : [];

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
                'py-6',
                withHeaderOffset ? 'top-16' : 'top-0',
                'h-[100vh]',
            )}
        >
            {sections.length > 0 ? (
                <>
                    <div className={tcls('text-sm', 'font-semibold', 'pb-3')}>
                        {t(getSpaceLanguage(customization), 'on_this_page')}
                    </div>
                    <div className={tcls('overflow-auto', 'flex-1')}>
                        <React.Suspense fallback={null}>
                            <ScrollSectionsList sections={sections} />
                        </React.Suspense>
                        {withPageFeedback ? (
                            <React.Suspense fallback={null}>
                                <div className={tcls('mt-5')}>
                                    <PageFeedbackForm spaceId={space.id} pageId={page.id} />
                                </div>
                            </React.Suspense>
                        ) : null}
                    </div>
                </>
            ) : null}
        </aside>
    );
}
