import type { RouteLayoutParams } from '@/app/utils';
import { EmbeddableSearchPage } from '@/components/Embeddable';
import { getEmbeddableDynamicContext } from '@/lib/embeddable';

type PageProps = {
    params: Promise<RouteLayoutParams>;
};

export const dynamic = 'force-static';

export default async function Page(props: PageProps) {
    const params = await props.params;
    const { context } = await getEmbeddableDynamicContext(params);

    return <EmbeddableSearchPage context={context} />;
}
