'use client';

import dynamic from 'next/dynamic';

import type { InlineExpressionVariables } from './types';

// Keeps `@gitbook/expr` out of the eager bundle; `ssr: true` keeps values in the HTML.
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
