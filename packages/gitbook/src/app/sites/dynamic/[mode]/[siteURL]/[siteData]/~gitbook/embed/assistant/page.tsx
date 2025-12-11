import type { RouteLayoutParams } from '@/app/utils';
import { EmbeddableAssistantPage } from '@/components/Embeddable';
import { getEmbeddableDynamicContext } from '@/lib/embeddable';
import { CustomizationAIMode } from '@gitbook/api';
import { redirect } from 'next/navigation';

type PageProps = {
    params: Promise<RouteLayoutParams>;
};

export const dynamic = 'force-static';

export default async function Page(props: PageProps) {
    const params = await props.params;
    const { context } = await getEmbeddableDynamicContext(params);

    // If the assistant is not enabled, redirect to the docs
    if (context.customization.ai.mode !== CustomizationAIMode.Assistant) {
        redirect(`${context.linker.toPathInSite('~gitbook/embed/page/')}`);
    }

    return (
        <EmbeddableAssistantPage
            baseURL={context.linker.toPathInSite('~gitbook/embed/')}
            siteTitle={context.site.title}
        />
    );
}
