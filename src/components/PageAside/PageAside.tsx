import DownloadCloud from '@geist-ui/icons/downloadCloud';
import Github from '@geist-ui/icons/github';
import Gitlab from '@geist-ui/icons/gitlab';
import { CustomizationSettings, JSONDocument, RevisionPageDocument, Space } from '@gitbook/api';
import React from 'react';
import urlJoin from 'url-join';

import { t, getSpaceLanguage } from '@/intl/server';
import { getDocument } from '@/lib/api';
import { getDocumentSections } from '@/lib/document';
import { absoluteHref } from '@/lib/links';
import { tcls } from '@/lib/tailwind';

import { ScrollSectionsList } from './ScrollSectionsList';
import { PageFeedbackForm } from '../PageFeedback';

/**
 * Aside listing the headings in the document.
 */
export async function PageAside(props: {
    space: Space;
    customization: CustomizationSettings;
    page: RevisionPageDocument;
    document: JSONDocument | null;
    withHeaderOffset: boolean;
    withFullPageCover: boolean;
    withPageFeedback: boolean;
}) {
    const { space, page, document, customization, withHeaderOffset, withPageFeedback } = props;

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
                        <PageFeedbackForm
                            spaceId={space.id}
                            pageId={page.id}
                            className={tcls('mt-2')}
                        />
                    </React.Suspense>
                ) : null}
                <div>
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
                                    'dark:text-light/5',
                                )}
                            >
                                {space.gitSync.installationProvider === 'gitlab' ? (
                                    <Gitlab className={tcls('size-4', 'mr-1.5')} />
                                ) : (
                                    <Github className={tcls('size-4', 'mr-1.5')} />
                                )}
                                {t(language, 'edit_on_git', getGitSyncName(space))}
                            </a>
                        </div>
                    ) : null}
                    {customization.pdf.enabled ? (
                        <div>
                            <a
                                href={absoluteHref('~gitbook/pdf')}
                                className={tcls(
                                    'flex',
                                    'flex-row',
                                    'items-center',
                                    'text-sm',
                                    'text-dark/6',
                                    'hover:text-primary',
                                    'py-2',
                                    'dark:text-light/5',
                                )}
                            >
                                <DownloadCloud className={tcls('size-4', 'mr-1.5')} />
                                {t(language, 'pdf_download')}
                            </a>
                        </div>
                    ) : null}
                </div>
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
