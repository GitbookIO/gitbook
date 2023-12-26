import Github from '@geist-ui/icons/github';
import Gitlab from '@geist-ui/icons/gitlab';
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
                'py-8',
                withHeaderOffset ? 'lg:h-[calc(100vh_-_4rem)]' : 'lg:h-[100vh]',
                withHeaderOffset ? 'top-16' : 'top-0',
                'h-[100vh]',
            )}
        >
            <div
                className={tcls(
                    'overflow-auto',
                    'flex-1',
                    'flex',
                    'flex-col',
                    'gap-4',
                    '[&::-webkit-scrollbar]:bg-transparent',
                    '[&::-webkit-scrollbar-thumb]:bg-transparent',
                )}
            >
                {sections.length > 0 ? (
                    <div>
                        {/*                         <div className={tcls('text-sm', 'font-semibold')}>
                            {t(language, 'on_this_page')}
                        </div> */}
                        <React.Suspense fallback={null}>
                            <ScrollSectionsList sections={sections} />
                        </React.Suspense>
                    </div>
                ) : null}
                {withPageFeedback ? (
                    <React.Suspense fallback={null}>
                        <PageFeedbackForm spaceId={space.id} pageId={page.id} />
                    </React.Suspense>
                ) : null}
                {customization.git.showEditLink && space.gitSync?.url && page.git ? (
                    <div>
                        <a
                            href={urlJoin(space.gitSync.url, page.git.path)}
                            className={tcls(
                                'flex',
                                'flex-row',
                                'items-center',
                                'text-sm',
                                'text-dark/6',
                                'hover:text-primary',
                                'py-2',
                                /*  '[&>svg]:[stroke-opacity:0.64]', */
                                'dark:text-light/5',
                            )}
                        >
                            {getGitSyncName(space) === 'GitHub' ? (
                                <Github className={tcls('size-4', 'mr-1.5')} />
                            ) : (
                                <Gitlab className={tcls('size-4', 'mr-1.5')} />
                            )}
                            {t(language, 'edit_on_git', getGitSyncName(space))}
                        </a>
                    </div>
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
