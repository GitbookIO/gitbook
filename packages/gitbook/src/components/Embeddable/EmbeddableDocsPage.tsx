import { type PagePathParams, getSitePageData } from '@/components/SitePage';

import { PageBody } from '@/components/PageBody';
import type { GitBookSiteContext } from '@/lib/context';
import { SiteInsightsDisplayContext } from '@gitbook/api';
import type { Metadata } from 'next';
import { Button } from '../primitives';
import {
    EmbeddableFrame,
    EmbeddableFrameBody,
    EmbeddableFrameButtons,
    EmbeddableFrameHeader,
    EmbeddableFrameHeaderMain,
} from './EmbeddableFrame';
import { EmbeddableIframeButtons } from './EmbeddableIframeAPI';

export const dynamic = 'force-static';

type EmbeddableDocsPageProps = {
    context: GitBookSiteContext;
    pageParams: PagePathParams;
};

/**
 * Page component for the embed docs page.
 */
export async function EmbeddableDocsPage(props: EmbeddableDocsPageProps) {
    const { context, pageParams } = props;
    const { page, document, ancestors, withPageFeedback } = await getSitePageData({
        context,
        pageParams,
    });

    return (
        <EmbeddableFrame>
            <EmbeddableFrameHeader>
                <EmbeddableFrameHeaderMain>
                    <Button
                        href={context.linker.toPathInSite('~gitbook/embed/assistant')}
                        size="default"
                        variant="blank"
                        icon="arrow-left"
                        label="Back"
                    />
                </EmbeddableFrameHeaderMain>
                <EmbeddableFrameButtons>
                    <EmbeddableIframeButtons />
                </EmbeddableFrameButtons>
            </EmbeddableFrameHeader>
            <EmbeddableFrameBody>
                <div className="flex-1 overflow-auto p-6">
                    <PageBody
                        context={context}
                        page={page}
                        ancestors={ancestors}
                        document={document}
                        withPageFeedback={withPageFeedback}
                        insightsDisplayContext={SiteInsightsDisplayContext.Embed}
                    />
                </div>
            </EmbeddableFrameBody>
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
