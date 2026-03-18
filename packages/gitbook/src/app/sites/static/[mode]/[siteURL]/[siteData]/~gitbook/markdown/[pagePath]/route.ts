import { type RouteParams, getPagePathFromParams, getStaticSiteContext } from '@/app/utils';
import { servePageMarkdown } from '@/routes/markdownPage';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-static';

export async function GET(_request: NextRequest, { params }: { params: Promise<RouteParams> }) {
    const { context } = await getStaticSiteContext(await params);
    const pathname = getPagePathFromParams(await params);
    return servePageMarkdown(context, pathname);
}
