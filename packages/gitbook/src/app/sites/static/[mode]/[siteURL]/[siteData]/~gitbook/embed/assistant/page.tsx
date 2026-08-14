import { redirect } from 'next/navigation';

import type { RouteParams } from '@/app/utils';
import { EmbeddableAssistantPage } from '@/components/Embeddable';
import { isAIChatEnabled } from '@/components/utils/isAIChatEnabled';
import { getEmbeddableStaticContext } from '@/lib/embeddable';

export const dynamic = 'force-static';

type PageProps = {
    params: Promise<RouteParams>;
};

export default async function Page(props: PageProps) {
    const params = await props.params;
    const { context } = await getEmbeddableStaticContext(params);

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
