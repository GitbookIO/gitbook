import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { type RouteParams, getPagePathFromParams } from '@/app/utils';
import { EmbeddableDocsPage, generateEmbeddableDocsPageMetadata } from '@/components/Embeddable';
import { getEmbeddableStaticContext } from '@/lib/embeddable';
import { parseUpdatesPageParam } from '@/lib/updates-url';

export const dynamic = 'force-static';

type PageProps = {
    params: Promise<RouteParams & { page: string }>;
};

export default async function Page(props: PageProps) {
    const params = await props.params;
    const updatesPage = parseUpdatesPageParam(params.page);
    if (updatesPage === null) {
        notFound();
    }
    const { context } = await getEmbeddableStaticContext(params);
    const pathname = getPagePathFromParams(params);

    return (
        <EmbeddableDocsPage
            context={context}
            pageParams={{ pathname }}
            staticRoute
            updatesPage={updatesPage}
        />
    );
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const updatesPage = parseUpdatesPageParam(params.page);
    if (updatesPage === null) {
        notFound();
    }
    const { context } = await getEmbeddableStaticContext(params);
    const pathname = getPagePathFromParams(params);
    return generateEmbeddableDocsPageMetadata({ context, pageParams: { pathname }, updatesPage });
}
