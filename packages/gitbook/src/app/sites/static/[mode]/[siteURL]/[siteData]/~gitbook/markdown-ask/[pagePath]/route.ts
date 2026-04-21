import { type RouteParams, getPagePathFromParams, getStaticSiteContext } from '@/app/utils';
import { serveAskMarkdown } from '@/routes/markdownAsk';
import type { NextRequest } from 'next/server';

export async function GET(rawRequest: NextRequest, { params }: { params: Promise<RouteParams> }) {
    const { context } = await getStaticSiteContext(await params);
    const pagePath = getPagePathFromParams(await params);

    return serveAskMarkdown(context, {
        question: rawRequest.nextUrl.searchParams.get('ask') ?? '',
        pagePath,
    });
}
