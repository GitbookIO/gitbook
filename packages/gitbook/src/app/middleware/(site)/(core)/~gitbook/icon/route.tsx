import type { NextRequest } from 'next/server';

import { getSiteContentPointer } from '@/lib/pointer';
import { fetchV1ContextForSitePointer } from '@/lib/v1';
import { serveIcon } from '@/routes/icon';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const pointer = await getSiteContentPointer();
    const context = await fetchV1ContextForSitePointer(pointer);

    return serveIcon(context, req);
}
