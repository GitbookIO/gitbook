import type { NextRequest } from 'next/server';

import { getSiteContentPointer } from '@/lib/pointer';
import { fetchV1ContextForSitePointer } from '@/lib/v1';
import { serveIcon } from '@/routes/icon';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    console.log('~gitbook/icon route');
    const pointer = await getSiteContentPointer();
    console.log('pointer', pointer);
    const context = await fetchV1ContextForSitePointer(pointer);
    console.log('context success');

    return serveIcon(context, req);
}
