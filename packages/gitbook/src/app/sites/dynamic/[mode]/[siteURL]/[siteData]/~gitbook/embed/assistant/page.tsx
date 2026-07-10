import type { RouteLayoutParams } from '@/app/utils';
import { EmbeddableAssistantPage } from '@/components/Embeddable';
import { isAIChatEnabled } from '@/components/utils/isAIChatEnabled';
import { getEmbeddableDynamicContext } from '@/lib/embeddable';
import { redirect } from 'next/navigation';

type PageProps = {
    params: Promise<RouteLayoutParams>;
};

export const dynamic = 'force-static';

export default async function Page(props: PageProps) {
    const params = await props.params;
    const { context } = await getEmbeddableDynamicContext(params);

    // If the assistant is not enabled, redirect to the docs
    if (!isAIChatEnabled(context.customization.ai.mode)) {
        redirect(`${context.linker.toPathInSite('~gitbook/embed/page/')}`);
    }

    return (
        <EmbeddableAssistantPage
            baseURL={context.linker.toPathInSite('~gitbook/embed/')}
            siteTitle={context.site.title}
        />
    );
}
