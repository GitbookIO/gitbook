import React from 'react';

import {
    type JSONDocument,
    type RevisionPageDocument,
    type RevisionTag,
    SiteAdsStatus,
    SiteInsightsAdPlacement,
} from '@gitbook/api';
import { Icon } from '@gitbook/icons';

import { Ad } from '../Ads';
import { UpdatesTagFilters } from '../DocumentView/UpdatesFilter';
import { PageFeedbackForm } from '../PageFeedback';
import { SideSheet } from '../primitives/SideSheet';
import { ThemeToggler } from '../ThemeToggler';
import { PageAsideCloseButton } from './PageAsideButton';
import { ScrollSectionsList } from './ScrollSectionsList';
import { ScrollToTopButton } from './ScrollToTopButton';
import { getSpaceLanguage, t, tString } from '@/intl/server';
import { cx } from '@/lib/classnames';
import type { GitBookSiteContext } from '@/lib/context';
import { getDocumentSections } from '@/lib/document-sections';

/**
 * Aside listing the headings in the document.
 */
export async function PageAside(props: {
    page: RevisionPageDocument;
    document: JSONDocument | null;
    filterableTags: RevisionTag[];
    context: GitBookSiteContext;
    withHeaderOffset: { sectionsHeader: boolean; topHeader: boolean };
    withFullPageCover: boolean;
    withPageFeedback: boolean;
}) {
    const { page, document, filterableTags, withPageFeedback, context } = props;
    const { customization, site } = context;
    const language = await getSpaceLanguage(context);

    return (
        <SideSheet
            side="right"
            toggleClass="outline-open"
            withOverlay
            withCloseButton
            className={cx(
                'page-aside',
                // Kept as utilities so they win over SideSheet's own `fixed inset-y-0 z-41`.
                'xl:sticky lg:top-0 lg:site-header:top-16 lg:site-header-sections:top-27 lg:z-10 lg:hover:z-12'
            )}
        >
            <div className="page-aside-inner">
                {page.layout.outline ? (
                    <>
                        {filterableTags.length > 0 ? (
                            <UpdatesTagFilters
                                tags={filterableTags}
                                tagsLabel={tString(language, 'tags')}
                                clearLabel={tString(language, 'clear')}
                            />
                        ) : null}
                        <div
                            className={cx(
                                'page-aside-header',
                                filterableTags.length > 0 && 'page-aside-header-tags'
                            )}
                        >
                            <ScrollToTopButton data-cover-aware-text className="page-aside-title">
                                <Icon icon="block-quote" className="size-3" />{' '}
                                {t(language, 'on_this_page')}
                            </ScrollToTopButton>
                            <PageAsideCloseButton className="page-api-block:min-[96rem]:hidden layout-default:xl:hidden layout-wide:3xl:hidden" />
                        </div>
                        <div className="page-aside-scroll">
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
        <div data-gb-page-outline className="page-aside-outline">
            <ScrollSectionsList sections={sections} />
        </div>
    ) : null;
}

function PageAsideActions(props: { withPageFeedback: boolean; page: RevisionPageDocument }) {
    const { page, withPageFeedback } = props;

    return (
        <div className="page-aside-actions">
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
        <div className="page-aside-footer">
            {/* Mode Switcher */}
            {customization.themes.toggeable ? (
                <div className="page-aside-theme">
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
