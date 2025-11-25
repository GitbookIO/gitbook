import { type RouteParams, getPagePathFromParams, getStaticSiteContext } from '@/app/utils';
import { servePageRSS } from '@/routes/rssPage';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-static';

export async function GET(_request: NextRequest, { params }: { params: Promise<RouteParams> }) {
    const { context } = await getStaticSiteContext(await params);
    const pathname = getPagePathFromParams(await params);

    const rssResponse = await servePageRSS(context, pathname);

    if (!rssResponse) {
        return new Response('RSS feed not found', {
            status: 404,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });
    }

    return rssResponse;
}
