'use client';

import type React from 'react';
import { useEmbeddableConfiguration } from './EmbeddableIframeAPI';

export function IfEmbeddableTrademark(props: {
    children: React.ReactNode;
}) {
    const { children } = props;
    const embedTrademarkEnabled = useEmbeddableConfiguration((state) => state.trademark ?? true);

    return embedTrademarkEnabled ? children : null;
}
