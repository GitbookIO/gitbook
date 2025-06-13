'use client';

import NextError from 'next/error';

export default function GlobalError({
    error,
}: {
    error: Error & { digest?: string };
}) {
    console.error('Global error:', error);
    return (
        <html lang="en">
            <body>
                <NextError statusCode={undefined as any} />
            </body>
        </html>
    );
}
