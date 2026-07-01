import type { RouteLayoutParams } from '@/app/utils';
import { isAIChatEnabled } from '@/components/utils/isAIChatEnabled';
import { getEmbeddableDynamicContext } from '@/lib/embeddable';
import { redirect } from 'next/navigation';

type PageProps = {
    params: Promise<RouteLayoutParams>;
};

export default async function Page(props: PageProps) {
    const params = await props.params;
    const { context } = await getEmbeddableDynamicContext(params);
    const baseURL = context.linker.toPathInSite('~gitbook/embed/');

    // If assistant is enabled, redirect to assistant, otherwise to docs
    if (isAIChatEnabled(context.customization.ai.mode)) {
        redirect(`${baseURL}/assistant`);
    } else {
        redirect(`${baseURL}/page/`);
    }
}
