import {
    CustomizationSettings,
    JSONDocument,
    RevisionPageDocument,
    Site,
    SiteAdsStatus,
    SiteCustomizationSettings,
    Space,
} from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import React from 'react';
import urlJoin from 'url-join';

import { t, getSpaceLanguage } from '@/intl/server';
import { getDocumentSections } from '@/lib/document';
import { absoluteHref } from '@/lib/links';
import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';
import { getPDFUrlSearchParams } from '@/lib/urls';

import { ScrollSectionsList } from './ScrollSectionsList';
import { Ad } from '../Ads';
import { PageFeedbackForm } from '../PageFeedback';

/**
 * Aside listing the headings in the document.
 */
export function PageAside(props: {
    space: Space;
    site: Site | undefined;
    customization: CustomizationSettings | SiteCustomizationSettings;
    page: RevisionPageDocument;
    document: JSONDocument | null;
    context: ContentRefContext;
    withHeaderOffset: boolean;
    withFullPageCover: boolean;
    withPageFeedback: boolean;
    withSections: boolean;
}) {
    const {
        space,
        site,
        page,
        document,
        customization,
        withHeaderOffset,
        withPageFeedback,
        withSections,
        context,
    } = props;
    const language = getSpaceLanguage(customization);

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
                'py-8',
                'break-anywhere', // To prevent long words in headings from breaking the layout
                'lg:h-full',
                withHeaderOffset ? 'lg:max-h-[calc(100vh_-_4rem)]' : 'lg:max-h-[100vh]',
                withHeaderOffset ? 'top-16' : 'top-0',
                'h-[100vh]',
                'page-api-block:xl:max-2xl:z-10',
                'page-api-block:xl:max-2xl:w-56',
                'page-api-block:xl:max-2xl:rounded',
                'page-api-block:xl:max-2xl:h-auto',
                'page-api-block:xl:max-2xl:py-0',
                'page-api-block:xl:max-2xl:mt-3',
                withHeaderOffset
                    ? 'page-api-block:xl:max-2xl:top-20'
                    : 'page-api-block:xl:max-2xl:top-0',
                'page-api-block:xl:max-2xl:float-right page-api-block:xl:max-2xl:right-0',
            )}
        >
            <div
                className={tcls(
                    // wrap aside's content with `position: absolute` so it doesn't change the flow of the rest of the document on hover
                    'absolute w-full h-fit z-10',
                    // When in api page mode, we display it as an overlay on non-large resolutions
                    'page-api-block:xl:max-2xl:bg-light-2/9 dark:page-api-block:xl:max-2xl:bg-dark-2/8 page-api-block:xl:max-2xl:backdrop-blur-md page-api-block:xl:max-2xl:backdrop-opacity-8 dark:page-api-block:xl:max-2xl:backdrop-opacity-10',
                )}
            >
                <div
                    className={tcls(
                        'hidden',
                        'page-api-block:xl:max-2xl:flex',
                        'flex-row',
                        'items-center',
                        'gap-3',
                        'text-sm',
                        'font-semibold',
                        'px-2',
                        'py-2',
                    )}
                >
                    <Icon icon="bars" className={tcls('size-3')} />
                    {t(language, 'on_this_page')}
                </div>
                <div
                    className={tcls(
                        'overflow-auto',
                        'flex-1',
                        'flex',
                        'flex-col',
                        'gap-4',
                        '[&::-webkit-scrollbar]:bg-transparent',
                        '[&::-webkit-scrollbar-thumb]:bg-transparent',

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
                            'page-api-block:xl:max-2xl:px-3',
                        )}
                    >
                        {withPageFeedback ? (
                            <React.Suspense fallback={null}>
                                <PageFeedbackForm
                                    spaceId={space.id}
                                    pageId={page.id}
                                    className={tcls('mt-2')}
                                />
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
                                        'dark:text-light/5',
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
                                    href={absoluteHref(
                                        `~gitbook/pdf?${getPDFUrlSearchParams({
                                            page: page.id,
                                            only: true,
                                        }).toString()}`,
                                    )}
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
                    placement="page.aside"
                    spaceId={space.id}
                    siteAdsStatus={site?.ads && site.ads.status ? site.ads.status : undefined}
                    ignore={process.env.NODE_ENV !== 'production'}
                    style={tcls('mt-4')}
                />
            </div>
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
