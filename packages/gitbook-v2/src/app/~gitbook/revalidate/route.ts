import { type NextRequest, NextResponse } from 'next/server';

import { GITBOOK_APP_SECRET } from '@v2/lib/env';
import { revalidateTag } from 'next/cache';

interface JsonBody {
    tags: string[];
}

/**
 * Revalidate cached data based on tags.
 * The body should be a JSON with { tags: string[] }
 */
export async function POST(req: NextRequest) {
    const json = (await req.json()) as JsonBody;

    if (GITBOOK_APP_SECRET && req.headers.get('x-gitbook-secret') !== GITBOOK_APP_SECRET) {
        return NextResponse.json(
            {
                error: 'Invalid secret',
            },
            { status: 401 }
        );
    }

    if (!json.tags || !Array.isArray(json.tags)) {
        return NextResponse.json(
            {
                error: 'tags must be an array',
            },
            { status: 400 }
        );
    }

    json.tags.forEach((tag) => {
        revalidateTag(tag);
    });

    return NextResponse.json({
        success: true,
    });
}
