import { servePageMarkdown } from '@/routes/markdownPage';
import { type RouteParams, getPagePathFromParams, getStaticSiteContext } from '@v2/app/utils';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-static';

export async function GET(_request: NextRequest, { params }: { params: Promise<RouteParams> }) {
    const { context } = await getStaticSiteContext(await params);
    const pathname = getPagePathFromParams(await params);
    return servePageMarkdown(context, pathname);
}
