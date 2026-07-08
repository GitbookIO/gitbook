import type { RouteLayoutParams } from '@/app/utils';
import { isAIChatEnabled } from '@/components/utils/isAIChatEnabled';
import { getEmbeddableDynamicContext } from '@/lib/embeddable';
import { redirect } from 'next/navigation';

type PageProps = {
    params: Promise<RouteLayoutParams>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: PageProps) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const { context } = await getEmbeddableDynamicContext(params);
    const baseURL = context.linker.toPathInSite('~gitbook/embed/');

    // Forward the query string to the default tab so params like `theme`, `jwt_token`
    // and `visitor.*` are not lost on the redirect (RND-11571 — `?theme=light` was
    // being dropped here, so the embed never applied the requested color scheme).
    const query = encodeQueryString(searchParams);

    // If assistant is enabled, redirect to assistant, otherwise to docs
    if (isAIChatEnabled(context.customization.ai.mode)) {
        redirect(`${baseURL}/assistant${query}`);
    } else {
        redirect(`${baseURL}/page/${query}`);
    }
}

/**
 * Serialize resolved Next.js search params back into a `?a=b&c=d` string (empty when there
 * are none), preserving repeated keys.
 */
function encodeQueryString(searchParams: { [key: string]: string | string[] | undefined }): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
        if (Array.isArray(value)) {
            value.forEach((entry) => params.append(key, entry));
        } else if (value !== undefined) {
            params.set(key, value);
        }
    }
    const encoded = params.toString();
    return encoded ? `?${encoded}` : '';
}
