import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import { serveAskMarkdown } from '@/routes/markdownAsk';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-static';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams & { question: string }> }
) {
    const { question: encodedQuestion } = await params;
    const { context } = await getStaticSiteContext(await params);
    const question = decodeURIComponent(encodedQuestion);

    return serveAskMarkdown(context, question);
}
