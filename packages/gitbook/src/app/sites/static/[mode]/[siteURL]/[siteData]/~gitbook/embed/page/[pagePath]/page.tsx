import { type RouteParams, getPagePathFromParams } from '@/app/utils';
import { EmbeddableDocsPage, generateEmbeddableDocsPageMetadata } from '@/components/Embeddable';
import { getEmbeddableStaticContext } from '@/lib/embeddable';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

type PageProps = {
    params: Promise<RouteParams>;
};

export default async function Page(props: PageProps) {
    const params = await props.params;
    const { context } = await getEmbeddableStaticContext(params);
    const pathname = getPagePathFromParams(params);

    return <EmbeddableDocsPage context={context} pageParams={{ pathname }} />;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const { context } = await getEmbeddableStaticContext(params);
    const pathname = getPagePathFromParams(params);
    return generateEmbeddableDocsPageMetadata({ context, pageParams: { pathname } });
}
