import type { NextRequest } from 'next/server';

import { serveResizedImage } from '@/routes/image';

export const runtime = 'edge';

/**
 * Top level image resizer for compatibility reasons with v1 of GitBook Open
 * where images were being resized relative to the root of the hostname instead of the content.
 *
 * It should not be used directly anymore.
 */
export async function GET(request: NextRequest) {
    return serveResizedImage(request);
}
