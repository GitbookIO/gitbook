import { type PagePathParams, getSitePageData } from '@/components/SitePage';
import type { GitBookSiteContext } from '@/lib/context';
import { SiteInsightsDisplayContext } from '@gitbook/api';
import type { Metadata } from 'next';
import { HeaderMobileMenu } from '../Header/HeaderMobileMenu';
import { SpacesDropdown, TranslationsDropdown } from '../Header/SpacesDropdown';
import { PageBody } from '../PageBody';
import { SiteSectionTabs, encodeClientSiteSections } from '../SiteSections';
import { categorizeVariants } from '../SpaceLayout/categorizeVariants';
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
import {
    EmbeddableIframeButtons,
    EmbeddableIframeCloseButton,
    EmbeddableIframeTabs,
} from './EmbeddableIframeAPI';

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

    const variants = categorizeVariants(context);

    return (
        <EmbeddableFrame className="site-background">
            <EmbeddableFrameSidebar>
                <EmbeddableIframeTabs
                    active="docs"
                    baseURL={context.linker.toPathInSite('~gitbook/embed/')}
                    siteTitle={context.site.title}
                />
                <EmbeddableIframeButtons />
                <EmbeddableIframeCloseButton />
            </EmbeddableFrameSidebar>
            <EmbeddableFrameMain
                data-testid="embed-docs-page"
                className={variants.generic.length > 1 ? 'has-sidebar' : 'no-sidebar'}
            >
                <div className="relative flex flex-col border-tint-subtle border-b theme-bold:bg-header-background">
                    <EmbeddableFrameHeader className="theme-bold:text-header-link">
                        <HeaderMobileMenu className="-ml-2 no-sidebar:hidden theme-bold:text-header-link hover:theme-bold:bg-header-link/3 hover:theme-bold:text-header-link lg:hidden" />
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
                        >
                            {variants.translations.length > 1 ? (
                                <TranslationsDropdown
                                    context={context}
                                    siteSpace={
                                        variants.translations.find(
                                            (space) => space.id === context.siteSpace.id
                                        ) ?? context.siteSpace
                                    }
                                    siteSpaces={variants.translations}
                                    className="my-1.5 ml-2 self-start"
                                />
                            ) : null}
                        </SiteSectionTabs>
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
                        <TableOfContents
                            className="layout-wide:no-sidebar:lg:hidden!"
                            context={context}
                            withTrademark={false}
                            header={
                                !context.sections && variants.translations.length > 1 ? (
                                    <TranslationsDropdown
                                        context={context}
                                        siteSpace={
                                            variants.translations.find(
                                                (space) => space.id === context.siteSpace.id
                                            ) ?? context.siteSpace
                                        }
                                        siteSpaces={variants.translations}
                                        className="max-md:[&_.button-content]:block"
                                    />
                                ) : null
                            }
                            innerHeader={
                                variants.generic.length > 1 ? (
                                    <div className="my-5 sidebar-default:mt-2 flex flex-col gap-2 px-5 empty:hidden">
                                        {variants.generic.length > 1 ? (
                                            <SpacesDropdown
                                                context={context}
                                                siteSpace={context.siteSpace}
                                                siteSpaces={variants.generic}
                                                className="w-full px-3"
                                            />
                                        ) : null}
                                    </div>
                                ) : null
                            }
                        />
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
