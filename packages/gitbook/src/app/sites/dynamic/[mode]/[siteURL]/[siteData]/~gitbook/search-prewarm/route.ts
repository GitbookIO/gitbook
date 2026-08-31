import { getSiteURLDataFromMiddleware } from '@/lib/middleware';
import { getServerActionBaseContext } from '@/lib/server-actions';

export async function POST() {
    const [context, siteURLData] = await Promise.all([
        getServerActionBaseContext(),
        getSiteURLDataFromMiddleware(),
    ]);
    const apiClient = await context.dataFetcher.api();

    await apiClient.orgs.prewarmSiteSearch(siteURLData.organization, siteURLData.site);

    return new Response(null, { status: 204 });
}
