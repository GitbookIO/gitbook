'use client';

import dynamic from 'next/dynamic';

import type { InlineExpressionVariables } from './types';

// `ssr: true` keeps the evaluated value in the server-rendered HTML; the boundary exists to move
// `@gitbook/expr` and its JS parser out of the route's eager entry.
const InlineExpressionValue = dynamic(
    () => import('./InlineExpressionValue').then((mod) => mod.InlineExpressionValue),
    { ssr: true }
);

export function InlineExpressionValueLazy(props: {
    expression: string;
    variables: InlineExpressionVariables;
}) {
    return <InlineExpressionValue {...props} />;
}
