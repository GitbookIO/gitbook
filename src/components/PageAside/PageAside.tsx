import IconArrowUpRight from '@geist-ui/icons/arrowUpRight';
import { CustomizationSettings, JSONDocument, RevisionPageDocument, Space } from '@gitbook/api';
import React from 'react';
import urlJoin from 'url-join';

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
    const language = getSpaceLanguage(customization);

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
            <div className={tcls('overflow-auto', 'flex-1', 'flex', 'flex-col', 'gap-4')}>
                {sections.length > 0 ? (
                    <div>
                        <div className={tcls('text-sm', 'font-semibold', 'pb-3')}>
                            {t(language, 'on_this_page')}
                        </div>
                        <React.Suspense fallback={null}>
                            <ScrollSectionsList sections={sections} />
                        </React.Suspense>
                    </div>
                ) : null}
                {customization.git.showEditLink && space.gitSync?.url && page.git ? (
                    <div>
                        <a
                            href={urlJoin(space.gitSync.url, page.git.path)}
                            className={tcls(
                                'flex',
                                'flex-row',
                                'text-sm',
                                'hover:text-primary',
                                'py-2',
                            )}
                        >
                            {t(language, 'edit_on_git', getGitSyncName(space))}
                            <IconArrowUpRight className={tcls('size-4', 'ml-1.5')} />
                        </a>
                    </div>
                ) : null}

                {withPageFeedback ? (
                    <React.Suspense fallback={null}>
                        <PageFeedbackForm spaceId={space.id} pageId={page.id} />
                    </React.Suspense>
                ) : null}
            </div>
        </aside>
    );
}

function getGitSyncName(space: Space): string {
    if (space.gitSync?.installationProvider === 'github') {
        return 'GitHub';
    } else if (space.gitSync?.installationProvider === 'gitlab') {
        return 'GitLab';
    }

    return 'Git';
}
