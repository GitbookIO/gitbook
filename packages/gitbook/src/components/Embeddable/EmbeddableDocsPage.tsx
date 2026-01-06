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
            <EmbeddableFrameMain>
                <div className="relative flex not-hydrated:animate-blur-in-slow flex-col">
                    <EmbeddableFrameHeader>
                        <HeaderMobileMenu className="-ml-2 page-no-toc:hidden" />
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
                            className="-mt-2 border-tint-subtle border-b"
                            sections={encodeClientSiteSections(context, context.sections)}
                        />
                    ) : null}
                </div>
                <EmbeddableFrameBody>
                    <ScrollContainer
                        orientation="vertical"
                        className="not-hydrated:animate-blur-in-slow"
                        contentClassName="p-4"
                        leading={{ fade: !context.sections, button: true }}
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
