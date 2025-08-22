import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-static';

/**
 * This route serves a quick demo to test the script.js script.
 * It is not used in production.
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const { context } = await getStaticSiteContext(await params);

    return new Response(
        `
<html>
    <head></head>
    <body></body>
    <script src="${context.linker.toAbsoluteURL(context.linker.toPathInSite('~gitbook/embed/script.js'))}"></script>
</html>
`,
        {
            headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        }
    );
}
