import { SiteContentPage } from '@v2/components/routes/SiteContentPage';
import { getDynamicSiteContext, RouteParams } from '@v2/app/utils';

export default async function Page({ params }: { params: Promise<RouteParams> }) {
    const context = await getDynamicSiteContext(await params);

    return <SiteContentPage context={context} />;
}
