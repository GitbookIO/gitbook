import type { GitBookSiteContext } from '@/lib/context';
import {
    type JSONDocument,
    type RevisionPageDocument,
    SiteAdsStatus,
    SiteInsightsAdPlacement,
} from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import React from 'react';

import { getSpaceLanguage, t } from '@/intl/server';
import { getDocumentSections } from '@/lib/document-sections';
import { tcls } from '@/lib/tailwind';

import { Ad } from '../Ads';
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
    const { customization, site } = context;

    return (
        <aside
            className={tcls(
                'group/aside',
                'order-last',
                'pt-8',
                'pb-4',

                // Hide by default
                'hidden',

                // Show on xl screens for default layout (normal sidebar)
                'xl:layout-default:flex',
                'xl:layout-default:max-w-56',
                'xl:layout-default:opacity-11',
                'xl:layout-default:ml-12',

                // Show on xl screens for OpenAPI layout (floating overlay)
                'xl:layout-openapi:flex',
                'xl:layout-openapi:opacity-100',
                'xl:layout-openapi:z-10',
                'xl:layout-openapi:fixed',
                'xl:layout-openapi:right-8',
                'xl:layout-openapi:w-60',
                'xl:layout-openapi:max-w-60',
                'xl:layout-openapi:pb-8',
                'xl:layout-openapi:pt-10',
                'xl:layout-openapi:ml-0',

                // Always hide for full-width layout
                'layout-full-width:hidden!',

                'overflow-hidden',

                'max-w-0',
                'opacity-0',

                // Hide when chat is open
                'xl:max-3xl:chat-open:hidden',
                'xl:max-3xl:chat-open:max-w-0',
                'xl:max-3xl:chat-open:opacity-0',
                'xl:max-3xl:chat-open:ml-0',

                'hydrated:starting:ml-0',
                'hydrated:starting:max-w-0',
                'hydrated:starting:opacity-0',

                'transition-[margin,max-width,opacity,display] duration-300',
                'transition-discrete',

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
                'lg:site-header:top-16',
                'lg:site-header:max-h-[calc(100vh-4rem)]',

                // With header & sections
                'lg:site-header-sections:top-27',
                'lg:site-header-sections:max-h-[calc(100vh-6.75rem)]',

                // Client-side dynamic positioning (CSS vars applied by script)
                'lg:[html[style*="--outline-top-offset"]_&]:top-(--outline-top-offset)!',
                'lg:[html[style*="--outline-height"]_&]:max-h-(--outline-height)!'
            )}
        >
            <div
                className={tcls(
                    'flex flex-col',
                    'min-w-56 shrink-0',
                    'overflow-hidden',
                    'w-full',

                    // OpenAPI layout: floating card styles
                    'xl:layout-openapi:rounded-md',
                    'xl:layout-openapi:circular-corners:rounded-xl',
                    'xl:layout-openapi:border',
                    'xl:layout-openapi:border-tint',
                    'xl:layout-openapi:bg-tint/9',
                    'xl:layout-openapi:backdrop-blur-lg',
                    'xl:layout-openapi:contrast-more:bg-tint',
                    'xl:layout-openapi:hover:shadow-lg',
                    'xl:layout-openapi:hover:shadow-tint-12/1',
                    'xl:dark:layout-openapi:hover:shadow-tint-1/1',
                    'xl:layout-openapi:not-hover:*:hidden'
                )}
            >
                <PageAsideHeader context={context} />
                {page.layout.outline ? (
                    <div className="flex shrink flex-col overflow-hidden">
                        {document ? (
                            <React.Suspense fallback={null}>
                                <PageAsideSections document={document} context={context} />
                            </React.Suspense>
                        ) : null}
                        <PageAsideActions page={page} withPageFeedback={withPageFeedback} />
                    </div>
                ) : null}
                {customization.themes.toggeable || site.ads ? (
                    <PageAsideFooter context={context} />
                ) : null}
            </div>
        </aside>
    );
}

/**
 * Header for the aside that shows "ON THIS PAGE" label.
 * Only visible in OpenAPI layout (floating overlay mode).
 */
function PageAsideHeader(props: { context: GitBookSiteContext }) {
    const { context } = props;
    const language = getSpaceLanguage(context);

    return (
        <div
            className={tcls(
                'hidden',
                'xl:layout-openapi:flex!',
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
        <div className="overflow-y-auto">
            <ScrollSectionsList sections={sections} />
        </div>
    ) : null;
}

function PageAsideActions(props: {
    withPageFeedback: boolean;
    page: RevisionPageDocument;
}) {
    const { page, withPageFeedback } = props;

    return (
        <div
            className={tcls(
                'flex flex-col gap-3',
                'border-tint-subtle border-t first:border-none',
                'sidebar-list-default:px-3 pt-5 first:pt-0',
                'xl:layout-openapi:p-5',
                'empty:hidden'
            )}
        >
            {withPageFeedback ? (
                <React.Suspense fallback={null}>
                    <PageFeedbackForm pageId={page.id} />
                </React.Suspense>
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
                'border-tint-subtle xl:layout-openapi:border-t xl:layout-openapi:p-2',
                'pt-4'
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
