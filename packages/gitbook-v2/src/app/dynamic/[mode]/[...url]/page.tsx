import { getDynamicSiteContext, RouteParams } from '@v2/app/utils';
import { SitePage } from '@/components/SitePage';

export default async function Page({ params }: { params: Promise<RouteParams> }) {
    const { context, pathname } = await getDynamicSiteContext(await params);

    return <SitePage context={context} pageParams={{ pathname }} redirectOnFallback={true} />;
}
