import type { GitBookSiteContext } from '@/lib/context';
import {
    type JSONDocument,
    type RevisionPageDocument,
    SiteAdsStatus,
    SiteInsightsAdPlacement,
    type Space,
} from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import React from 'react';
import urlJoin from 'url-join';

import { getSpaceLanguage, t } from '@/intl/server';
import { getDocumentSections } from '@/lib/document-sections';
import { tcls } from '@/lib/tailwind';

import { Ad } from '../Ads';
import { getPDFURLSearchParams } from '../PDF';
import { PageFeedbackForm } from '../PageFeedback';
import { ThemeToggler } from '../ThemeToggler';
import { ScrollSectionsList } from './ScrollSectionsList';

/**
 * Aside listing the headings in the document.
 */
export function PageAside(props: {
    page: RevisionPageDocument;
    document: JSONDocument | null;
    context: GitBookSiteContext;
    withHeaderOffset: { sectionsHeader: boolean; topHeader: boolean };
    withFullPageCover: boolean;
    withPageFeedback: boolean;
}) {
    const { page, document, withPageFeedback, context } = props;
    const { customization, site, space } = context;
    const language = getSpaceLanguage(customization);

    const pdfHref = context.linker.toPathInSpace(
        `~gitbook/pdf?${getPDFURLSearchParams({
            page: page.id,
            only: true,
            limit: 100,
        }).toString()}`
    );
    return (
        <aside
            className={tcls(
                'group/aside',
                'hidden',
                'xl:flex',
                'xl:max-3xl:chat-open:hidden',
                'xl:max-3xl:chat-open:opacity-0',
                'max-w-56',
                'xl:max-3xl:*:chat-open:w-56',
                'xl:max-3xl:chat-open:max-w-0',
                'xl:max-3xl:chat-open:ml-0',

                'motion-safe:xl:transition-all motion-safe:xl:duration-300',
                'motion-safe:transition-discrete',

                'flex-col',
                'basis-56',
                'xl:ml-12',
                'grow-0',
                'shrink-0',
                'break-anywhere', // To prevent long words in headings from breaking the layout

                'text-tint',
                'contrast-more:text-tint-strong',
                'sticky',
                // Without header
                'lg:top-0',
                'lg:max-h-screen',

                // With header
                'lg:site-header:top-16',
                'lg:site-header:max-h-[calc(100vh-4rem)]',

                // With header & sections
                'lg:site-header-sections:top-27',
                'lg:site-header-sections:max-h-[calc(100vh-6.75rem)]',

                // When in api page mode, we display it as an overlay on non-large resolutions
                'xl:max-2xl:page-api-block:z-10',
                'xl:max-2xl:page-api-block:fixed',
                'xl:max-2xl:page-api-block:right-8',
                'xl:max-2xl:page-api-block:w-56',
                'xl:max-2xl:page-api-block:bg-tint/9',
                'xl:max-2xl:contrast-more:page-api-block:bg-tint',
                'xl:max-2xl:page-api-block:backdrop-blur-lg',
                'xl:max-2xl:page-api-block:border',
                'xl:max-2xl:page-api-block:border-tint',
                'xl:max-2xl:page-api-block:hover:shadow-lg',
                'xl:max-2xl:page-api-block:hover:shadow-tint-12/1',
                'xl:max-2xl:dark:page-api-block:hover:shadow-tint-1/1',
                'xl:max-2xl:page-api-block:rounded-md',
                'xl:max-2xl:page-api-block:h-auto',
                'xl:max-2xl:page-api-block:my-9',
                'page-api-block:px-2',
                'page-api-block:py-1.5'
            )}
        >
            {page.layout.outline ? (
                <>
                    <div
                        className={tcls(
                            'hidden',
                            'xl:max-2xl:page-api-block:flex',
                            'text-xs',
                            'tracking-wide',
                            'font-semibold',
                            'uppercase',

                            'flex-row',
                            'items-center',
                            'gap-2'
                        )}
                    >
                        <Icon icon="block-quote" className={tcls('size-3')} />
                        {t(language, 'on_this_page')}
                        <Icon
                            icon="chevron-down"
                            className={tcls(
                                'size-3',
                                'opacity-6',
                                'ml-auto',
                                'xl:max-2xl:page-api-block:group-hover/aside:hidden'
                            )}
                        />
                    </div>
                    <div
                        className={tcls(
                            'overflow-y-auto',
                            'overflow-x-visible',

                            'flex',
                            'flex-col',
                            'shrink',
                            'pb-12',

                            'sticky',
                            'lg:top:0',
                            'lg:site-header:top-16',
                            'lg:site-header-sections:top-27',

                            'gap-6',
                            'pt-10',

                            'xl:max-2xl:page-api-block:py-0',
                            // Hide it for api page, until hovered
                            'xl:max-2xl:page-api-block:hidden',
                            'xl:max-2xl:page-api-block:group-hover/aside:flex'
                        )}
                    >
                        {document ? (
                            <React.Suspense fallback={null}>
                                <PageAsideSections document={document} context={context} />
                            </React.Suspense>
                        ) : null}
                        <div
                            className={tcls(
                                'flex',
                                'flex-col',
                                'gap-3',
                                'sidebar-list-default:px-3',
                                'border-t',
                                'first:border-none',
                                'border-tint-subtle',
                                'py-6',
                                'first:pt-0',
                                'xl:max-2xl:page-api-block:px-3',
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
                                            'links-accent:hover:decoration-primary-subtle',
                                            'py-2'
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
                                            'links-accent:hover:decoration-primary-subtle',
                                            'py-2'
                                        )}
                                    >
                                        <Icon
                                            icon="file-pdf"
                                            className={tcls('size-4', 'mr-1.5')}
                                        />
                                        {t(language, 'pdf_download')}
                                    </a>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </>
            ) : null}
            <div
                className={tcls(
                    'sticky bottom-0 z-10 mt-auto flex flex-col bg-tint-base theme-gradient-tint:bg-gradient-tint theme-gradient:bg-gradient-primary theme-muted:bg-tint-subtle pb-4 xl:max-2xl:page-api-block:hidden xl:max-2xl:page-api-block:pb-0 xl:max-2xl:page-api-block:group-hover/aside:flex [html.sidebar-filled.theme-bold.tint_&]:bg-tint-subtle',
                    'xl:max-2xl:page-api-block:bg-transparent'
                )}
            >
                {/* Mode Switcher */}
                {customization.themes.toggeable ? (
                    <div className="mt-4 flex items-center justify-end">
                        <React.Suspense fallback={null}>
                            <ThemeToggler />
                        </React.Suspense>
                    </div>
                ) : null}
                <Ad
                    zoneId={
                        site?.ads && site.ads.status === SiteAdsStatus.Live ? site.ads.zoneId : null
                    }
                    placement={SiteInsightsAdPlacement.Aside}
                    spaceId={space.id}
                    siteAdsStatus={site?.ads?.status ? site.ads.status : undefined}
                    ignore={process.env.NODE_ENV !== 'production'}
                    style={site?.ads ? 'mt-4' : undefined}
                />
            </div>
        </aside>
    );
}

async function PageAsideSections(props: { document: JSONDocument; context: GitBookSiteContext }) {
    const { document, context } = props;

    const sections = await getDocumentSections(context, document);

    return sections.length > 1 ? <ScrollSectionsList sections={sections} /> : null;
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
