'use client';

import { captureException } from '@sentry/nextjs';
import Error from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({ error }: { error: Error }) {
    useEffect(() => {
        captureException(error);
    }, [error]);

    return (
        <html>
            <body>
                <Error statusCode={undefined as any} />
            </body>
        </html>
    );
}
