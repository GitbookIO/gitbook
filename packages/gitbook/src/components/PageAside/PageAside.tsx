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

import { Icon } from '@gitbook/icons';
import { Ad } from '../Ads';
import { PageFeedbackForm } from '../PageFeedback';
import { ThemeToggler } from '../ThemeToggler';
import { SideSheet } from '../primitives/SideSheet';
import { PageAsideCloseButton } from './PageAsideButton';
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
        <SideSheet
            side="right"
            toggleClass="outline-open"
            withOverlay={true}
            withCloseButton={true}
            className={tcls(
                'group/aside',
                'order-last',

                'xl:sticky',
                'w-64',

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
                'lg:[html[style*="--outline-height"]_&]:max-h-(--outline-height)!',

                'layout-default:max-xl:border-l',
                'layout-wide:max-4xl:border-l',
                'border-tint-subtle',

                'p-4',
                'pt-8',
                'ml-4',

                'break-anywhere', // To prevent long words in headings from breaking the layout

                'lg:z-10',
                'layout-default:xl:not-chat-open:pr-0',
                'layout-default:xl:not-chat-open:pl-8',
                'layout-default:xl:not-chat-open:flex!',
                'layout-default:xl:not-chat-open:animate-none!',
                'layout-default:3xl:flex!',
                'layout-default:3xl:animate-none!',

                // In layout-wide mode (2-column), hide outline when viewport is too narrow
                // or when chat is open and viewport is narrow, to prevent layout overflow
                'layout-wide:xl:-mr-68',
                'layout-wide:4xl:not-chat-open:flex!',
                'layout-wide:4xl:not-chat-open:animate-none!',
                'layout-wide:min-[150rem]:animate-none!',
                'layout-wide:min-[150rem]:flex!',
                // 'layout-wide:chat-open:max-[2416px]:hidden',

                // In layout-full mode (1-column, no TOC), position outline as a fixed sidebar on the right
                // Hide it on narrow viewports (< 3xl) to prevent overlap with content
                'layout-full:3xl:flex!',
                'layout-full:3xl:animate-none!',
                'layout-full:3xl:fixed',

                'bg-tint-base',
                'text-tint',
                'contrast-more:text-tint-strong'
            )}
        >
            <div className="flex h-full w-full shrink-0 flex-col overflow-hidden">
                {page.layout.outline ? (
                    <>
                        <div className="mb-2 flex page-no-outline:hidden items-center justify-between">
                            <h6 className="flex items-center gap-1 font-semibold text-tint text-xs uppercase leading-wider">
                                <Icon icon="block-quote" className="size-3" /> On this page
                            </h6>
                            <PageAsideCloseButton />
                        </div>
                        <div className="flex shrink flex-col overflow-hidden">
                            {document ? (
                                <React.Suspense fallback={null}>
                                    <PageAsideSections document={document} context={context} />
                                </React.Suspense>
                            ) : null}
                            <PageAsideActions page={page} withPageFeedback={withPageFeedback} />
                        </div>
                    </>
                ) : null}
                {customization.themes.toggeable || site.ads ? (
                    <PageAsideFooter context={context} />
                ) : null}
            </div>
        </SideSheet>
    );
}

async function PageAsideSections(props: { document: JSONDocument; context: GitBookSiteContext }) {
    const { document, context } = props;

    const sections = await getDocumentSections(context, document);

    return sections.length > 1 ? (
        <div data-gb-page-outline className="overflow-y-auto">
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
