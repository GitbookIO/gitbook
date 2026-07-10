import { type RouteLayoutParams, getSiteURLDataFromParams } from '@/app/utils';
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
    // Forward the forced theme to the default tab so `?theme=` isn't lost on the redirect. It comes
    // from the route context (set by the middleware), so reading it keeps this route static. RND-11571
    const embedTheme = getSiteURLDataFromParams(params).embedTheme;
    const query = embedTheme ? `?theme=${embedTheme}` : '';

    // If assistant is enabled, redirect to assistant, otherwise to docs
    if (isAIChatEnabled(context.customization.ai.mode)) {
        redirect(`${baseURL}/assistant${query}`);
    } else {
        redirect(`${baseURL}/page/${query}`);
    }
}
