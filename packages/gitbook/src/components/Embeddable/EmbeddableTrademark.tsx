'use client';

import type React from 'react';
import { useEmbeddableConfiguration } from './EmbeddableIframeAPI';

export function EmbeddableTrademark(props: {
    trademark: boolean;
    children: React.ReactNode;
}) {
    const { trademark, children } = props;
    const embedTrademarkEnabled = useEmbeddableConfiguration((state) => state.trademark ?? true);

    return trademark && embedTrademarkEnabled ? <>{children}</> : null;
}
