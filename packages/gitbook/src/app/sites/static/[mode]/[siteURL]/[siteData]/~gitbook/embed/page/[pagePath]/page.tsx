import { type RouteParams, getPagePathFromParams } from '@/app/utils';
import { getSitePageData } from '@/components/SitePage';

import { PageBody } from '@/components/PageBody';
import type { Metadata } from 'next';
import { getEmbedSiteContext } from '../../context';

export const dynamic = 'force-static';

type PageProps = {
    params: Promise<RouteParams>;
};

/**
 * Render a page in its embedded view.
 */
export default async function EmbedPage(props: PageProps) {
    const params = await props.params;
    const { context } = await getEmbedSiteContext(params);
    const pathname = getPagePathFromParams(params);
    const { page, document, ancestors, withPageFeedback } = await getSitePageData({
        context,
        pageParams: { pathname },
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

export async function generateMetadata(_props: PageProps): Promise<Metadata> {
    return {
        robots: { index: false, follow: false },
    };
}
