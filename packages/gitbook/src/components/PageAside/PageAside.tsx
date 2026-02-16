import type { GitBookSiteContext } from '@/lib/context';
import { getDocumentSections } from '@/lib/document-sections';
import { tcls } from '@/lib/tailwind';
import {
    type JSONDocument,
    type RevisionPageDocument,
    SiteAdsStatus,
    SiteInsightsAdPlacement,
} from '@gitbook/api';
import React from 'react';

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
                'hidden',
                'pt-8',
                'pb-4',
                'ml-12',

                'xl:flex',

                'overflow-hidden',

                'basis-56',
                'grow-0',
                'shrink-0',
                'break-anywhere', // To prevent long words in headings from breaking the layout

                'xl:max-3xl:chat-open:hidden',
                'mr-0',

                'layout-wide:-mr-68',
                'layout-wide:max-4xl:hidden',
                'layout-wide:chat-open:max-[2416px]:hidden',

                'layout-full:max-3xl:hidden',
                'layout-full:w-56',
                'layout-full:fixed',
                'layout-full:right-4',
                'layout-full:h-full',
                'layout-full:z-30',

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
                className={tcls('flex flex-col', 'min-w-56 shrink-0', 'overflow-hidden', 'w-full')}
            >
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
                'border-tint-subtle',
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
