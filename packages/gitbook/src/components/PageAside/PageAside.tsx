import {
    CustomizationSettings,
    JSONDocument,
    RevisionPageDocument,
    Site,
    SiteAdsStatus,
    SiteCustomizationSettings,
    SiteInsightsAdPlacement,
    Space,
} from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import React from 'react';
import urlJoin from 'url-join';

import { t, getSpaceLanguage } from '@/intl/server';
import { getDocumentSections } from '@/lib/document-sections';
import { getAbsoluteHref } from '@/lib/links';
import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';
import { getPDFUrlSearchParams } from '@/lib/urls';

import { ScrollSectionsList } from './ScrollSectionsList';
import { Ad } from '../Ads';
import { PageFeedbackForm } from '../PageFeedback';

function getTopOffset(props: { sectionsHeader: boolean; topHeader: boolean }) {
    if (props.topHeader && props.sectionsHeader) {
        return 'lg:top-[6.75rem] lg:max-h-[calc(100vh_-_6.75rem)]';
    }

    if (props.topHeader) {
        return 'lg:top-16 lg:max-h-[calc(100vh_-_4rem)]';
    }

    return 'lg:top-0 lg:max-h-screen';
}

/**
 * Aside listing the headings in the document.
 */
export async function PageAside(props: {
    space: Space;
    site: Site | undefined;
    customization: CustomizationSettings | SiteCustomizationSettings;
    page: RevisionPageDocument;
    document: JSONDocument | null;
    context: ContentRefContext;
    withHeaderOffset: { sectionsHeader: boolean; topHeader: boolean };
    withFullPageCover: boolean;
    withPageFeedback: boolean;
}) {
    const {
        space,
        site,
        page,
        document,
        customization,
        withHeaderOffset,
        withPageFeedback,
        context,
    } = props;
    const language = getSpaceLanguage(customization);

    const topOffset = getTopOffset(withHeaderOffset);
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
                'sticky',
                'break-anywhere', // To prevent long words in headings from breaking the layout

                'text-gray',
                'contrast-more:text-gray-strong',

                // When in api page mode, we display it as an overlay on non-large resolutions
                'page-api-block:xl:max-2xl:z-10',
                'page-api-block:xl:max-2xl:fixed',
                'page-api-block:xl:max-2xl:right-8',
                'page-api-block:xl:max-2xl:w-56',
                'page-api-block:xl:max-2xl:bg-gray/9',
                'page-api-block:xl:max-2xl:contrast-more:bg-gray',
                'page-api-block:xl:max-2xl:backdrop-blur-lg',
                'page-api-block:xl:max-2xl:border',
                'page-api-block:xl:max-2xl:border-gray',
                'page-api-block:xl:max-2xl:hover:shadow-lg',
                'page-api-block:xl:max-2xl:hover:shadow-gray-12/1',
                'page-api-block:xl:max-2xl:dark:hover:shadow-gray-1/1',
                'page-api-block:xl:max-2xl:rounded-md',
                'page-api-block:xl:max-2xl:h-auto',
                'page-api-block:xl:max-2xl:my-8',

                topOffset,
            )}
        >
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
                    'p-2',
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
                    'overflow-auto',
                    'overflow-x-visible',
                    'flex-1',
                    'flex',
                    'flex-col',
                    'gap-6',
                    'py-8',
                    '[&::-webkit-scrollbar]:bg-transparent',
                    '[&::-webkit-scrollbar-thumb]:bg-transparent',

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
                        'border-gray-subtle',
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
                                    'hover:text-tint',
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
                                    'hover:text-tint',
                                    'py-2',
                                )}
                            >
                                <Icon icon="file-pdf" className={tcls('size-4', 'mr-1.5')} />
                                {t(language, 'pdf_download')}
                            </a>
                        </div>
                    ) : null}
                </div>
            </div>
            <Ad
                zoneId={
                    site?.ads && site.ads.status === SiteAdsStatus.Live ? site.ads.zoneId : null
                }
                placement={SiteInsightsAdPlacement.Aside}
                spaceId={space.id}
                siteAdsStatus={site?.ads && site.ads.status ? site.ads.status : undefined}
                ignore={process.env.NODE_ENV !== 'production'}
                style={tcls(site?.ads && site.ads.status === SiteAdsStatus.Live && ['mb-4'])}
            />
        </aside>
    );
}

async function PageAsideSections(props: { document: JSONDocument; context: ContentRefContext }) {
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
