import { NextRequest, NextResponse } from 'next/server';
import { invalidateCacheTags } from '@/lib/cache';

export const runtime = 'edge';

/**
 * Revalidate cached data based on tags.
 * The body should be a JSON with { tags: string[] }
 */
export async function POST(req: NextRequest) {
    const json = await req.json();

    if (!json.tags || !Array.isArray(json.tags)) {
        return NextResponse.json(
            {
                error: 'tags must be an array',
            },
            { status: 400 },
        );
    }

    await invalidateCacheTags(json.tags);

    return NextResponse.json({
        success: true,
    });
}
