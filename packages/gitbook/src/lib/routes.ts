import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

import { GITBOOK_SECRET } from './env';

/**
 * Verify the signature of the request and call the function with the body.
 */
export async function withVerifySignature<T>(
    request: Request,
    fn: (body: T) => Promise<NextResponse>
) {
    // Fail closed when no secret is configured, consistent with force-revalidate.
    if (!GITBOOK_SECRET) {
        return NextResponse.json({ error: 'Revalidation is disabled' }, { status: 403 });
    }

    try {
        const rawBody = await request.text();
        const body = JSON.parse(rawBody) as T;

        // Retrieve the signature header from the request
        const incomingSignature = request.headers.get('x-gitbook-signature');
        if (!incomingSignature) {
            return NextResponse.json({ error: 'Missing signature header' }, { status: 400 });
        }

        const computedSignature = crypto
            .createHmac('sha256', GITBOOK_SECRET)
            .update(rawBody)
            .digest('hex');

        // Compare incoming signature to computed signature
        if (incomingSignature !== computedSignature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        return await fn(body);
    } catch (_error) {
        return NextResponse.json(
            { error: 'Invalid request or unable to parse JSON' },
            { status: 400 }
        );
    }
}
