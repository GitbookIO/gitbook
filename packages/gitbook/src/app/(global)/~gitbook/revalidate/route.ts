import { type NextRequest, NextResponse } from 'next/server';

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
    let json: JsonBody;

    try {
        json = await req.json();
    } catch (err) {
        return NextResponse.json({
            error: `invalid json body: ${err}`,
        })
    }   

    if (!json.tags || !Array.isArray(json.tags)) {
        return NextResponse.json(
            {
                error: 'tags must be an array',
            },
            { status: 400 }
        );
    }

    try {
        const result = await revalidateTags(json.tags);
        return NextResponse.json({
            success: true,
            stats: result.stats,
        });
    } catch (err: unknown) {
        return NextResponse.json({
            error: `unexpected error ${err}`,
            stack: err instanceof Error ? err.stack : null,
        }, { status: 500 });
    }
}
