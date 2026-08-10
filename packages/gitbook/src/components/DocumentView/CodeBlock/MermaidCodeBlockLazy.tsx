'use client';

import dynamic from 'next/dynamic';
import type { ClientBlockProps } from './ClientCodeBlock';

// Keeps react-aria and @panzoom/panzoom out of the entry chunk for the many pages that have code
// blocks but no diagram. `ssr: true` so real diagram blocks still server-render their skeleton.
const MermaidCodeBlock = dynamic(
    () => import('./MermaidCodeBlock').then((mod) => mod.MermaidCodeBlock),
    { ssr: true }
);

export function MermaidCodeBlockLazy(props: ClientBlockProps) {
    return <MermaidCodeBlock {...props} />;
}
