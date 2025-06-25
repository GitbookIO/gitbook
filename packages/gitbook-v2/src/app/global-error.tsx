'use client';

import { createLogger } from '@/lib/logger';
import NextError from 'next/error';

export default function GlobalError({
    error,
}: {
    error: Error & { digest?: string };
}) {
    // We cannot use the logger here because this is a client component.
    createLogger('GBOV2:GlobalError', {}).error('An error occurred in the application', error);
    return (
        <html lang="en">
            <body>
                <NextError statusCode={undefined as any} />
            </body>
        </html>
    );
}
