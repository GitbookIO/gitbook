import type { RouteLayoutParams } from '@/app/utils';
import { EmbeddableAssistantPage } from '@/components/Embeddable';
import { getEmbeddableDynamicContext } from '@/lib/embeddable';

export const dynamic = 'force-static';

type PageProps = {
    params: Promise<RouteLayoutParams>;
};

export default async function Page(props: PageProps) {
    const params = await props.params;
    const { context } = await getEmbeddableDynamicContext(params);

    return <EmbeddableAssistantPage context={context} />;
}
