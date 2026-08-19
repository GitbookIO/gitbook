'use client';

import dynamic from 'next/dynamic';

import type { ClientBlockProps } from './ClientCodeBlock';

// `ssr: true` keeps the evaluated code in the server-rendered HTML; the point of the boundary is to
// move `@gitbook/expr` (~254 KB with its parser) out of the route's eager entry.
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
