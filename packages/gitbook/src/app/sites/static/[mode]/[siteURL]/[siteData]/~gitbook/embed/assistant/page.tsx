import type { RouteLayoutParams } from '@/app/utils';
import { getEmbedSiteContext } from '../context';
import { AIEmbedChat } from './AIEmbedChat';

export const dynamic = 'force-static';

type PageProps = {
    params: Promise<RouteLayoutParams>;
};

export default async function EmbedAssistantPage(props: PageProps) {
    const params = await props.params;
    const { context } = await getEmbedSiteContext(params);

    return <AIEmbedChat trademark={context.customization.trademark.enabled} />;
}
