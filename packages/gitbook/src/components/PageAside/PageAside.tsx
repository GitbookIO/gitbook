import {
    type JSONDocument,
    type RevisionPageDocument,
    SiteAdsStatus,
    SiteInsightsAdPlacement,
} from '@gitbook/api';
import type { GitBookSiteContext } from '@v2/lib/context';
import React from 'react';

import { tcls } from '@/lib/tailwind';

import { AdaptivePane } from '../Adaptive/AdaptivePane';
import { Ad } from '../Ads';
import { ThemeToggler } from '../ThemeToggler';
import { PageActions } from './PageActions';
import { PageOutline } from './PageOutline';

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

    const useAdaptivePane = true;

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
                'text-sm',
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
                'page-api-block:p-2'
            )}
        >
            <div className="lg:top:0 sticky flex grow flex-col gap-6 overflow-y-auto overflow-x-visible border-none py-8 *:border-tint-subtle site-header-sections:lg:top-[6.75rem] site-header:lg:top-16 [&>*:not(:first-child)]:border-t [&>*:not(:first-child)]:pt-6">
                {useAdaptivePane ? <AdaptivePane /> : null}
                {page.layout.outline ? (
                    <>
                        <PageOutline document={document} context={context} />
                        <PageActions
                            page={page}
                            context={context}
                            withPageFeedback={withPageFeedback}
                        />
                    </>
                ) : null}
            </div>
            <div
                className={tcls(
                    'sticky bottom-0 z-10 mt-auto flex flex-col bg-tint-base theme-gradient-tint:bg-gradient-tint theme-gradient:bg-gradient-primary theme-muted:bg-tint-subtle pb-4 page-api-block:xl:max-2xl:hidden page-api-block:xl:max-2xl:pb-0 page-api-block:xl:max-2xl:group-hover/aside:flex [html.sidebar-filled.theme-bold.tint_&]:bg-tint-subtle',
                    'page-api-block:xl:max-2xl:bg-transparent'
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
