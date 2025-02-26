'use client';

import { captureException } from '@sentry/nextjs';
import NextError from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({ error }: { error: Error }) {
    useEffect(() => {
        captureException(error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <NextError statusCode={undefined as any} />
            </body>
        </html>
    );
}
