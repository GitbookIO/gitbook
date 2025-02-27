import type { NextRequest } from 'next/server';

import { getSiteContentPointer } from '@/lib/pointer';
import { fetchV1ContextForSitePointer } from '@/lib/v1';
import { serveLLMsTxt } from '@/routes/llms';

export const runtime = 'edge';

export async function GET(_req: NextRequest) {
    const pointer = await getSiteContentPointer();
    const context = await fetchV1ContextForSitePointer(pointer);

    return serveLLMsTxt(context);
}
