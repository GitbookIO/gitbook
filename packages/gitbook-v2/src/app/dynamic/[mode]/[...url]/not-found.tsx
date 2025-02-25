import { SitePageNotFound } from '@/components/SitePage';
import { getDynamicSiteContext, RouteParams } from '@v2/app/utils';

export default async function NotFound({ params }: { params: Promise<RouteParams> }) {
    const { context } = await getDynamicSiteContext(await params);

    return <SitePageNotFound context={context} />;
}
