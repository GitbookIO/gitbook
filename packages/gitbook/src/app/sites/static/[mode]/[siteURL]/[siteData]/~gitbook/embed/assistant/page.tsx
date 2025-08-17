import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';

export const dynamic = 'force-static';

type PageProps = {
    params: Promise<RouteLayoutParams>;
};

export default async function EmbedAssistantPage(props: PageProps) {
    const params = await props.params;
    const { context } = await getStaticSiteContext(params);

    return (
        <div>
            <h1>Hello</h1>
        </div>
    );
}
