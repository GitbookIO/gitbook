import { SitePageNotFound } from '@/components/SitePage';
import { getStaticSiteContext } from '@v2/app/utils';
import { getURLFromMiddleware, getURLModeFromMiddleware } from '@v2/lib/middleware';

export default async function NotFound() {
    return <div>Not Found dynamic (TODO)</div>;
    // const { context } = await getStaticSiteContext({
    //     url: await getURLFromMiddleware(),
    //     mode: await getURLModeFromMiddleware(),
    // });

    // return <SitePageNotFound context={context} />;
}
