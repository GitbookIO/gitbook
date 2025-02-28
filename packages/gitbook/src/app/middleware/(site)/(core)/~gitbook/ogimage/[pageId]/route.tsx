import type { NextRequest } from 'next/server';

import type { PageIdParams } from '@/components/SitePage';
import { getSiteContentPointer } from '@/lib/pointer';
import { fetchV1ContextForSitePointer } from '@/lib/v1';
import { serveOGImage } from '@/routes/ogimage';

export const runtime = 'edge';

export async function GET(_req: NextRequest, { params }: { params: Promise<PageIdParams> }) {
    const pointer = await getSiteContentPointer();
    const baseContext = await fetchV1ContextForSitePointer(pointer);

    return serveOGImage(baseContext, await params);
}
