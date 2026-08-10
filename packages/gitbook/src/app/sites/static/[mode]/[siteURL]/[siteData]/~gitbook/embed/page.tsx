import type { RouteLayoutParams } from '@/app/utils';
import { isAIChatEnabled } from '@/components/utils/isAIChatEnabled';
import { getEmbeddableStaticContext } from '@/lib/embeddable';
import { redirect } from 'next/navigation';

export const dynamic = 'force-static';

type PageProps = {
    params: Promise<RouteLayoutParams>;
};

export default async function Page(props: PageProps) {
    const params = await props.params;
    const { context } = await getEmbeddableStaticContext(params);
    const baseURL = context.linker.toPathInSite('~gitbook/embed/');

    // If assistant is enabled, redirect to assistant, otherwise to docs
    if (isAIChatEnabled(context.customization.ai.mode)) {
        redirect(`${baseURL}/assistant`);
    } else {
        redirect(`${baseURL}/page/`);
    }
}
