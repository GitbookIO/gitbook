import {
    JSONDocument,
    RevisionPageDocument,
    SiteAdsStatus,
    SiteInsightsAdPlacement,
    Space,
} from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import { GitBookSiteContext } from '@v2/lib/context';
import React from 'react';
import urlJoin from 'url-join';

import { t, getSpaceLanguage } from '@/intl/server';
import { getDocumentSections } from '@/lib/document-sections';
import { getAbsoluteHref } from '@/lib/links';
import { resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';
import { getPDFUrlSearchParams } from '@/lib/urls';

import { ScrollSectionsList } from './ScrollSectionsList';
import { Ad } from '../Ads';
import { PageFeedbackForm } from '../PageFeedback';
import { ThemeToggler } from '../ThemeToggler';

/**
 * Aside listing the headings in the document.
 */
export async function PageAside(props: {
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

    const pdfHref = await getAbsoluteHref(
        `~gitbook/pdf?${getPDFUrlSearchParams({
            page: page.id,
            only: true,
        }).toString()}`,
    );
    return (
        <aside
            className={tcls(
                'group/aside',
                'hidden',
                'xl:flex',
                'flex-col',
                'basis-56',
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
                'site-header:lg:top-16',
                'site-header:lg:max-h-[calc(100vh_-_4rem)]',

                // With header & sections
                'site-header-sections:lg:top-[6.75rem]',
                'site-header-sections:lg:max-h-[calc(100vh_-_6.75rem)]',

                // When in api page mode, we display it as an overlay on non-large resolutions
                'page-api-block:xl:max-2xl:z-10',
                'page-api-block:xl:max-2xl:fixed',
                'page-api-block:xl:max-2xl:right-8',
                'page-api-block:xl:max-2xl:w-56',
                'page-api-block:xl:max-2xl:bg-tint/9',
                'page-api-block:xl:max-2xl:contrast-more:bg-tint',
                'page-api-block:xl:max-2xl:backdrop-blur-lg',
                'page-api-block:xl:max-2xl:border',
                'page-api-block:xl:max-2xl:border-tint',
                'page-api-block:xl:max-2xl:hover:shadow-lg',
                'page-api-block:xl:max-2xl:hover:shadow-tint-12/1',
                'page-api-block:xl:max-2xl:dark:hover:shadow-tint-1/1',
                'page-api-block:xl:max-2xl:rounded-md',
                'page-api-block:xl:max-2xl:h-auto',
                'page-api-block:xl:max-2xl:my-8',
                'page-api-block:p-2',
            )}
        >
            {page.layout.outline ? (
                <>
                    <div
                        className={tcls(
                            'hidden',
                            'page-api-block:xl:max-2xl:flex',
                            'text-xs',
                            'tracking-wide',
                            'font-semibold',
                            'uppercase',

                            'flex-row',
                            'items-center',
                            'gap-2',
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
                                'page-api-block:xl:max-2xl:group-hover/aside:hidden',
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
                            'site-header:lg:top-16',
                            'site-header-sections:lg:top-[6.75rem]',

                            'gap-6',
                            'pt-8',

                            'page-api-block:xl:max-2xl:py-0',
                            // Hide it for api page, until hovered
                            'page-api-block:xl:max-2xl:hidden',
                            'page-api-block:xl:max-2xl:group-hover/aside:flex',
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
                                'py-4',
                                'first:pt-0',
                                'page-api-block:xl:max-2xl:px-3',
                                'empty:hidden',
                            )}
                        >
                            {withPageFeedback ? (
                                <React.Suspense fallback={null}>
                                    <PageFeedbackForm pageId={page.id} className={tcls('mt-2')} />
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
                                            'py-2',
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
                                            'py-2',
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
                    'pb-4 sticky bottom-0 bg-tint-base theme-muted:bg-tint-subtle theme-bold-tint:bg-tint-subtle theme-gradient:bg-gradient-primary theme-gradient-tint:bg-gradient-tint z-10 mt-auto flex flex-col page-api-block:xl:max-2xl:pb-0 page-api-block:xl:max-2xl:hidden page-api-block:xl:max-2xl:group-hover/aside:flex',
                    'page-api-block:xl:max-2xl:bg-transparent',
                )}
            >
                {/* Mode Switcher */}
                {customization.themes.toggeable ? (
                    <div className="flex items-center justify-end mt-4">
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
                    siteAdsStatus={site?.ads && site.ads.status ? site.ads.status : undefined}
                    ignore={process.env.NODE_ENV !== 'production'}
                    style={site?.ads ? 'mt-4' : undefined}
                />
            </div>
        </aside>
    );
}

async function PageAsideSections(props: { document: JSONDocument; context: GitBookSiteContext }) {
    const { document, context } = props;

    const sections = await getDocumentSections(document, (ref) => resolveContentRef(ref, context));

    return sections.length > 1 ? <ScrollSectionsList sections={sections} /> : null;
}

function getGitSyncName(space: Space): string {
    if (space.gitSync?.installationProvider === 'github') {
        return 'GitHub';
    } else if (space.gitSync?.installationProvider === 'gitlab') {
        return 'GitLab';
    }

    return 'Git';
}
