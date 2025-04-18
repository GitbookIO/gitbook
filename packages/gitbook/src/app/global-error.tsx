'use client';

import NextError from 'next/error';

export default function GlobalError() {
    return (
        <html lang="en">
            <body>
                <NextError statusCode={undefined as any} />
            </body>
        </html>
    );
}
