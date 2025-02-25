import { SitePageNotFound } from '@/components/SitePage';
import { getStaticSiteContext, RouteParams } from '@v2/app/utils';

export default async function NotFound({ params }: { params: Promise<RouteParams> }) {
    // TODO: how to make it work as not-found doesn't get any props?

    const { context } = await getStaticSiteContext(await params);

    return <SitePageNotFound context={context} />;
}
