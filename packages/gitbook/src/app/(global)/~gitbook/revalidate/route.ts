import { NextRequest, NextResponse } from 'next/server';

import { revalidateTags } from '@/lib/cache';

export const runtime = 'edge';

interface JsonBody {
    tags: string[];
    purge?: boolean;
}

/**
 * Revalidate cached data based on tags.
 * The body should be a JSON with { tags: string[] }
 */
export async function POST(req: NextRequest) {
    const json = (await req.json()) as JsonBody;

    if (!json.tags || !Array.isArray(json.tags)) {
        return NextResponse.json(
            {
                error: 'tags must be an array',
            },
            { status: 400 },
        );
    }

    const result = await revalidateTags(json.tags);

    return NextResponse.json({
        success: true,
        keys: result.keys,
        stats: result.stats,
    });
}
