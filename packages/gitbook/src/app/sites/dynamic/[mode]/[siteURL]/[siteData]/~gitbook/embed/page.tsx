import { type RouteLayoutParams, getSiteURLDataFromParams } from '@/app/utils';
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
    // Forward the forced theme to the default tab so `?theme=` isn't lost on the redirect. It comes
    // from the route context (set by the middleware), not the query, so the embed stays static. RND-11571
    const embedTheme = getSiteURLDataFromParams(params).embedTheme;
    const query = embedTheme ? `?theme=${embedTheme}` : '';

    // If assistant is enabled, redirect to assistant, otherwise to docs
    if (isAIChatEnabled(context.customization.ai.mode)) {
        redirect(`${baseURL}/assistant${query}`);
    } else {
        redirect(`${baseURL}/page/${query}`);
    }
}
