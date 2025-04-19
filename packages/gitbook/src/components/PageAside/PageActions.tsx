import { getSpaceLanguage, t } from '@/intl/server';
import { tcls } from '@/lib/tailwind';
import type { RevisionPageDocument, Space } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import type { GitBookSiteContext } from '@v2/lib/context';
import React from 'react';
import urlJoin from 'url-join';
import { getPDFURLSearchParams } from '../PDF';
import { PageFeedbackForm } from '../PageFeedback';

export function PageActions(props: {
    page: RevisionPageDocument;
    context: GitBookSiteContext;
    withPageFeedback: boolean;
}) {
    const { page, withPageFeedback, context } = props;
    const { customization, space } = context;
    const language = getSpaceLanguage(customization);

    const pdfHref = context.linker.toPathInSpace(
        `~gitbook/pdf?${getPDFURLSearchParams({
            page: page.id,
            only: true,
            limit: 100,
        }).toString()}`
    );

    return (
        <div
            className={tcls(
                'flex',
                'flex-col',
                'gap-2',
                'sidebar-list-default:px-3',
                'page-api-block:xl:max-2xl:px-3',
                'empty:hidden'
            )}
        >
            {withPageFeedback ? (
                <React.Suspense fallback={null}>
                    <PageFeedbackForm pageId={page.id} />
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
                            'hover:text-tint-strong',
                            'links-accent:hover:underline',
                            'links-accent:hover:underline-offset-4',
                            'links-accent:hover:decoration-[3px]',
                            'links-accent:hover:decoration-primary-subtle'
                        )}
                    >
                        <Icon
                            icon={
                                space.gitSync.installationProvider === 'gitlab'
                                    ? 'gitlab'
                                    : 'github'
                            }
                            className={tcls('size-4', 'mr-1.5')}
                        />
                        {t(language, 'edit_on_git', getGitSyncName(space))}
                    </a>
                </div>
            ) : null}
            {customization.pdf.enabled ? (
                <div>
                    <a
                        href={pdfHref}
                        className={tcls(
                            'flex',
                            'flex-row',
                            'items-center',
                            'text-sm',
                            'hover:text-tint-strong',
                            'links-accent:hover:underline',
                            'links-accent:hover:underline-offset-4',
                            'links-accent:hover:decoration-[3px]',
                            'links-accent:hover:decoration-primary-subtle'
                        )}
                    >
                        <Icon icon="file-pdf" className={tcls('size-4', 'mr-1.5')} />
                        {t(language, 'pdf_download')}
                    </a>
                </div>
            ) : null}
        </div>
    );
}

function getGitSyncName(space: Space): string {
    if (space.gitSync?.installationProvider === 'github') {
        return 'GitHub';
    }
    if (space.gitSync?.installationProvider === 'gitlab') {
        return 'GitLab';
    }

    return 'Git';
}
