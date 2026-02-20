import { type PagePathParams, getSitePageData } from '@/components/SitePage';
import type { GitBookSiteContext } from '@/lib/context';
import { SiteInsightsDisplayContext } from '@gitbook/api';
import type { Metadata } from 'next';
import { HeaderMobileMenu } from '../Header/HeaderMobileMenu';
import { PageBody } from '../PageBody';
import { SiteSectionTabs, encodeClientSiteSections } from '../SiteSections';
import { TableOfContents } from '../TableOfContents';
import { ScrollContainer } from '../primitives/ScrollContainer';
import { EmbeddableDocsPageControlButtons } from './EmbeddableDocsPageControlButtons';
import {
    EmbeddableFrame,
    EmbeddableFrameBody,
    EmbeddableFrameButtons,
    EmbeddableFrameHeader,
    EmbeddableFrameHeaderMain,
    EmbeddableFrameMain,
    EmbeddableFrameSidebar,
    EmbeddableFrameTitle,
} from './EmbeddableFrame';
import { EmbeddableIframeButtons, EmbeddableIframeTabs } from './EmbeddableIframeAPI';

export const dynamic = 'force-static';

type EmbeddableDocsPageProps = {
    context: GitBookSiteContext;
    pageParams: PagePathParams;
};

/**
 * Page component for the embed docs page.
 */
export async function EmbeddableDocsPage(
    props: EmbeddableDocsPageProps & { staticRoute: boolean }
) {
    const { context, pageParams } = props;
    const { page, document, ancestors, withPageFeedback } = await getSitePageData({
        context,
        pageParams,
    });

    return (
        <EmbeddableFrame className="site-background">
            <EmbeddableFrameSidebar>
                <EmbeddableIframeTabs
                    active="docs"
                    baseURL={context.linker.toPathInSite('~gitbook/embed/')}
                    siteTitle={context.site.title}
                />
                <EmbeddableIframeButtons />
            </EmbeddableFrameSidebar>
            <EmbeddableFrameMain data-testid="embed-docs-page">
                <div className="relative flex flex-col border-tint-subtle border-b theme-bold:bg-header-background">
                    <EmbeddableFrameHeader className="theme-bold:text-header-link">
                        <HeaderMobileMenu className="-ml-2 layout-wide:hidden theme-bold:text-header-link hover:theme-bold:bg-header-link/3 hover:theme-bold:text-header-link lg:hidden" />
                        <EmbeddableFrameHeaderMain>
                            <EmbeddableFrameTitle>{context.site.title}</EmbeddableFrameTitle>
                        </EmbeddableFrameHeaderMain>
                        <EmbeddableFrameButtons>
                            <EmbeddableDocsPageControlButtons
                                href={context.linker
                                    .toPathForPage({
                                        pages: context.revision.pages,
                                        page,
                                    })
                                    .replace(/~gitbook\/embed\/page\/?/, '')}
                            />
                        </EmbeddableFrameButtons>
                    </EmbeddableFrameHeader>
                    {context.sections ? (
                        <SiteSectionTabs
                            className="not-theme-bold:-mt-2 theme-bold:bg-tint-base"
                            sections={encodeClientSiteSections(context, context.sections)}
                        />
                    ) : null}
                </div>
                <EmbeddableFrameBody>
                    <ScrollContainer
                        orientation="vertical"
                        className="-mx-4 not-hydrated:animate-blur-in-slow"
                        contentClassName="flex-row px-4"
                        leading={{ fade: false, button: true }}
                        trailing={{ fade: false, button: true }}
                    >
                        <TableOfContents context={context} withTrademark={false} />
                        <PageBody
                            context={context}
                            page={page}
                            ancestors={ancestors}
                            document={document}
                            withPageFeedback={withPageFeedback}
                            insightsDisplayContext={SiteInsightsDisplayContext.Embed}
                            staticRoute={props.staticRoute}
                        />
                    </ScrollContainer>
                </EmbeddableFrameBody>
            </EmbeddableFrameMain>
        </EmbeddableFrame>
    );
}

export async function generateEmbeddableDocsPageMetadata(
    _props: EmbeddableDocsPageProps
): Promise<Metadata> {
    return {
        robots: { index: false, follow: false },
    };
}
