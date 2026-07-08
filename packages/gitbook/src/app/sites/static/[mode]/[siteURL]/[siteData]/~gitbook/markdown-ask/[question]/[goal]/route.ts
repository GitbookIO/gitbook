import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import { serveAskMarkdown } from '@/routes/markdownAsk';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-static';

/**
 * Serve an AI answer as markdown for a page, steered by the end goal ("goal")
 * the calling agent provided via the `?goal=` search parameter.
 *
 * The goal is encoded as a path segment (rather than read from the query) because
 * this route is statically rendered, mirroring how the question itself is handled.
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams & { question: string; goal: string }> }
) {
    const { question: encodedQuestion, goal: encodedGoal } = await params;
    const { context } = await getStaticSiteContext(await params);
    const question = decodeURIComponent(encodedQuestion);
    const goal = decodeURIComponent(encodedGoal);

    return serveAskMarkdown(context, question, { goal });
}
