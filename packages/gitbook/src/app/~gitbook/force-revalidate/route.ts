import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

import { withVerifySignature } from '@/lib/routes';

interface JsonBody {
    // The paths need to be the rewritten ones
    paths: string[];
}

export async function POST(req: NextRequest) {
    return withVerifySignature<JsonBody>(req, async (body) => {
        if (!body.paths || !Array.isArray(body.paths)) {
            return NextResponse.json({ error: 'paths must be an array' }, { status: 400 });
        }

        const results = await Promise.allSettled(
            body.paths.map((path) => {
                // biome-ignore lint/suspicious/noConsole: we want to log here
                console.log(`Revalidating path: ${path}`);
                revalidatePath(path);
                return Promise.resolve();
            })
        );

        return NextResponse.json({
            success: results.every((result) => result.status === 'fulfilled'),
            errors: results
                .filter((result) => result.status === 'rejected')
                .map((result) => (result as PromiseRejectedResult).reason),
        });
    });
}
