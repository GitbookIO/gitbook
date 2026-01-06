import type { RouteParams } from '@/app/utils';
import { EmbeddableAssistantPage } from '@/components/Embeddable';
import { getEmbeddableStaticContext } from '@/lib/embeddable';
import { CustomizationAIMode } from '@gitbook/api';
import { redirect } from 'next/navigation';

export const dynamic = 'force-static';

type PageProps = {
    params: Promise<RouteParams>;
};

export default async function Page(props: PageProps) {
    const params = await props.params;
    const { context } = await getEmbeddableStaticContext(params);

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
