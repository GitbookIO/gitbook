'use client';

import dynamic from 'next/dynamic';

import type { ClientBlockProps } from './ClientCodeBlock';

// Keeps `@gitbook/expr` out of the eager bundle; `ssr: true` keeps values in the HTML.
const ClientCodeBlockWithExpressions = dynamic(
    () =>
        import('./ClientCodeBlockWithExpressions').then(
            (mod) => mod.ClientCodeBlockWithExpressions
        ),
    { ssr: true }
);

export function ClientCodeBlockWithExpressionsLazy(props: ClientBlockProps) {
    return <ClientCodeBlockWithExpressions {...props} />;
}
