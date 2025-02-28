import type { NextRequest } from 'next/server';

import { serveResizedImage } from '@/routes/image';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    return serveResizedImage(request);
}
