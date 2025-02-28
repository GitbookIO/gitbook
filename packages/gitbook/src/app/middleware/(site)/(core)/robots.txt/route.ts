import type { NextRequest } from 'next/server';

import { getSiteContentPointer } from '@/lib/pointer';
import { fetchV1ContextForSitePointer } from '@/lib/v1';
import { serveRobotsTxt } from '@/routes/robots';

export const runtime = 'edge';

export async function GET(_request: NextRequest) {
    const pointer = await getSiteContentPointer();
    const context = await fetchV1ContextForSitePointer(pointer);

    return serveRobotsTxt(context);
}
