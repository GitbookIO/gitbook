import type { NextRequest } from 'next/server';

import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import { linkerWithMarkdownPages } from '@/lib/links';
import { serveLLMsTxt } from '@/routes/llms';

export const dynamic = 'force-static';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const { context: baseContext } = await getStaticSiteContext(await params);

    const context = {
        ...baseContext,
        linker: linkerWithMarkdownPages(baseContext.linker),
    };

    return serveLLMsTxt(context);
}
