import { type PagePathParams, getSitePageData } from '@/components/SitePage';

import { PageBody } from '@/components/PageBody';
import type { GitBookSiteContext } from '@/lib/context';
import type { Metadata } from 'next';

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
        <div className="flex-1 overflow-auto p-6">
            <PageBody
                context={context}
                page={page}
                ancestors={ancestors}
                document={document}
                withPageFeedback={withPageFeedback}
            />
        </div>
    );
}

export async function generateEmbeddableDocsPageMetadata(
    _props: EmbeddableDocsPageProps
): Promise<Metadata> {
    return {
        robots: { index: false, follow: false },
    };
}
