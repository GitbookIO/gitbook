'use client';

import dynamic from 'next/dynamic';
import type { OpenAPIBlockClientProps } from './OpenAPIBlockClient';

// `ssr: true` keeps the operation in the server-rendered HTML — API reference content is the whole
// SEO point of these pages.
const OpenAPIBlockClient = dynamic(
    () => import('./OpenAPIBlockClient').then((mod) => mod.OpenAPIBlockClient),
    { ssr: true }
);

export function OpenAPIBlockLazy(props: OpenAPIBlockClientProps) {
    return <OpenAPIBlockClient {...props} />;
}
