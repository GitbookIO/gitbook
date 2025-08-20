import type { RouteLayoutParams } from '@/app/utils';
import { getEmbeddableContext } from '@/lib/embeddable';
import { AIEmbedChat } from './AIEmbedChat';

export const dynamic = 'force-static';

type PageProps = {
    params: Promise<RouteLayoutParams>;
};

export default async function EmbedAssistantPage(props: PageProps) {
    const params = await props.params;
    const { context } = await getEmbeddableContext(params);

    return <AIEmbedChat trademark={context.customization.trademark.enabled} />;
}
