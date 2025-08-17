import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import { AIEmbedChat } from './AIEmbedChat';

export const dynamic = 'force-static';

type PageProps = {
    params: Promise<RouteLayoutParams>;
};

export default async function EmbedAssistantPage(props: PageProps) {
    const params = await props.params;
    const { context } = await getStaticSiteContext(params);

    return <AIEmbedChat trademark={context.customization.trademark.enabled} />;
}
