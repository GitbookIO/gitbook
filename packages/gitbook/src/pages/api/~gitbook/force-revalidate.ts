import crypto from 'node:crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

interface JsonBody {
    // The paths need to be the rewritten one, `res.revalidate` call don't go through the middleware
    paths: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const signatureHeader = req.headers['x-gitbook-signature'] as string | undefined;
    if (!signatureHeader) {
        return res.status(400).json({ error: 'Missing signature header' });
    }
    // We cannot use env from `@/v2/lib/env` here as it make it crash because of the import "server-only" in the file.
    if (process.env.GITBOOK_SECRET) {
        try {
            const computedSignature = crypto
                .createHmac('sha256', process.env.GITBOOK_SECRET)
                .update(JSON.stringify(req.body))
                .digest('hex');

            if (computedSignature === signatureHeader) {
                const results = await Promise.allSettled(
                    (req.body as JsonBody).paths.map((path) => {
                        // biome-ignore lint/suspicious/noConsole: we want to log here
                        console.log(`Revalidating path: ${path}`);
                        return res.revalidate(path);
                    })
                );
                return res.status(200).json({
                    success: results.every((result) => result.status === 'fulfilled'),
                    errors: results
                        .filter((result) => result.status === 'rejected')
                        .map((result) => (result as PromiseRejectedResult).reason),
                });
            }
            return res.status(401).json({ error: 'Invalid signature' });
        } catch (error) {
            console.error('Error during revalidation:', error);
            return res.status(400).json({ error: 'Invalid request or unable to parse JSON' });
        }
    }
    // If no secret is set, we do not allow revalidation
    return res.status(403).json({ error: 'Revalidation is disabled' });
}
