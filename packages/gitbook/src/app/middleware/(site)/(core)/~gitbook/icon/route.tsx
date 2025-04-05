import type { NextRequest } from 'next/server';

import { getSiteContentPointer } from '@/lib/pointer';
import { fetchV1ContextForSitePointer } from '@/lib/v1';
import { serveIcon } from '@/routes/icon';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const pointer = await getSiteContentPointer();
        const context = await fetchV1ContextForSitePointer(pointer);

        // biome-ignore lint/suspicious/noConsole: we want to log here
        console.log(`serving icon for ${context.site.id}`);
        const response = await serveIcon(context, req);
        // biome-ignore lint/suspicious/noConsole: we want to log here
        console.log(`served icon for ${context.site.id}`);
        return response;
    } catch (err) {
        // biome-ignore lint/suspicious/noConsole: we want to log here
        console.log(`serveIcon error: ${err}`, (err as Error).stack);
        throw err;
    }
}
