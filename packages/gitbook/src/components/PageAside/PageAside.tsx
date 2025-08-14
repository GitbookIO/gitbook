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

    return (
        <aside
            className={tcls(
                'group/aside',
                'hidden',
                'pt-8',

                'xl:flex',
                'xl:max-3xl:chat-open:hidden',
                'xl:max-3xl:chat-open:opacity-0',
                'max-w-56',

                // Animate the width of the aside when the chat is open
                'xl:max-3xl:*:chat-open:w-56',
                'xl:max-3xl:chat-open:max-w-0',
                'xl:max-3xl:chat-open:ml-0',

                'motion-safe:xl:transition-[width,max-width,margin,opacity,display] motion-safe:xl:duration-300',
                'motion-safe:transition-discrete',

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

                // Client-side dynamic positioning (CSS vars applied by script)
                'lg:[html[style*="--toc-top-offset"]_&]:top-(--toc-top-offset)!',
                'lg:[html[style*="--toc-height"]_&]:max-h-(--toc-height)!',

                // When in api page mode, we display it as an overlay on non-large resolutions
                'xl:max-2xl:page-api-block:z-10',
                'xl:max-2xl:page-api-block:fixed',
                'xl:max-2xl:page-api-block:right-8',
                'xl:max-2xl:page-api-block:w-60',
                'xl:max-2xl:page-api-block:max-w-60',
                'xl:max-2xl:page-api-block:pb-8',
                'xl:max-2xl:page-api-block:pt-10',
                'xl:max-2xl:[body:has(.openapi-block):has(.page-has-ancestors)_&]:pt-6.5'
            )}
        >
            <div
                className={tcls(
                    'flex flex-col',
                    'overflow-hidden',
                    'w-full',
                    'xl:max-2xl:page-api-block:rounded-md',
                    'xl:max-2xl:page-api-block:border',
                    'xl:max-2xl:page-api-block:border-tint',
                    'xl:max-2xl:page-api-block:bg-tint/9',
                    'xl:max-2xl:page-api-block:backdrop-blur-lg',
                    'xl:max-2xl:contrast-more:page-api-block:bg-tint',
                    'xl:max-2xl:page-api-block:hover:shadow-lg',
                    'xl:max-2xl:page-api-block:hover:shadow-tint-12/1',
                    'xl:max-2xl:dark:page-api-block:hover:shadow-tint-1/1',
                    'xl:max-2xl:page-api-block:not-hover:*:hidden'
                )}
            >
                <PageAsideHeader context={context} />
                {page.layout.outline ? (
                    <div className="overflow-y-auto border-tint xl:max-2xl:page-api-block:border-t">
                        {document ? (
                            <React.Suspense fallback={null}>
                                <PageAsideSections document={document} context={context} />
                            </React.Suspense>
                        ) : null}
                        <PageAsideActions
                            page={page}
                            withPageFeedback={withPageFeedback}
                            context={context}
                        />
                    </div>
                ) : null}
                <PageAsideFooter context={context} />
            </div>
        </aside>
    );
}

function PageAsideHeader(props: { context: GitBookSiteContext }) {
    const { context } = props;
    const language = getSpaceLanguage(context.customization);

    return (
        <div
            className={tcls(
                'hidden',
                'xl:max-2xl:page-api-block:flex!',
                'text-xs',
                'tracking-wide',
                'font-semibold',
                'uppercase',
                'px-2',
                'py-1.5',

                'flex-row',
                'items-center',
                'gap-2'
            )}
        >
            <Icon icon="block-quote" className={tcls('size-3')} />
            {t(language, 'on_this_page')}
            <Icon icon="chevron-down" className={tcls('size-3', 'opacity-6', 'ml-auto')} />
        </div>
    );
}

async function PageAsideSections(props: { document: JSONDocument; context: GitBookSiteContext }) {
    const { document, context } = props;

    const sections = await getDocumentSections(context, document);

    return sections.length > 1 ? (
        <div className="-mt-8 pt-8 pb-5 empty:hidden xl:max-2xl:page-api-block:mt-0 xl:max-2xl:page-api-block:p-2">
            <ScrollSectionsList sections={sections} />
        </div>
    ) : null;
}

function PageAsideActions(props: {
    withPageFeedback: boolean;
    context: GitBookSiteContext;
    page: RevisionPageDocument;
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
                'gap-3',
                'sidebar-list-default:px-3',
                'border-t',
                'first:border-none',
                'border-tint-subtle',
                'py-5',
                'first:pt-0',
                'xl:max-2xl:page-api-block:px-5',
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
                        <Icon icon="file-pdf" className={tcls('size-4', 'mr-1.5')} />
                        {t(language, 'pdf_download')}
                    </a>
                </div>
            ) : null}
        </div>
    );
}

async function PageAsideFooter(props: { context: GitBookSiteContext }) {
    const { context } = props;
    const { customization, site, space } = context;

    return (
        <div
            className={tcls(
                'sticky bottom-0 z-10 mt-auto flex flex-col',
                'bg-tint-base theme-gradient-tint:bg-gradient-tint theme-gradient:bg-gradient-primary theme-muted:bg-tint-subtle [html.sidebar-filled.theme-bold.tint_&]:bg-tint-subtle',
                'xl:max-2xl:page-api-block:border-t xl:max-2xl:page-api-block:p-2',
                'py-4'
            )}
        >
            {/* Mode Switcher */}
            {customization.themes.toggeable ? (
                <div className="flex items-center justify-end">
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
