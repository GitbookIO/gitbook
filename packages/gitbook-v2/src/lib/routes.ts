import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { GITBOOK_SECRET } from './env';

/**
 * Verify the signature of the request and call the function with the body.
 */
export async function withVerifySignature<T>(
    request: Request,
    fn: (body: T) => Promise<NextResponse>
) {
    try {
        const rawBody = await request.text();
        const body = JSON.parse(rawBody) as T;

        if (GITBOOK_SECRET) {
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
        }

        return await fn(body);
    } catch (_error) {
        return NextResponse.json(
            { error: 'Invalid request or unable to parse JSON' },
            { status: 400 }
        );
    }
}
