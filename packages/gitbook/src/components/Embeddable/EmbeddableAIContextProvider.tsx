'use client';

import { type AIConfig, AIContextProvider } from '@/components/AI';
import type { PropsWithChildren } from 'react';
import { useEmbeddableConfiguration } from './EmbeddableIframeAPI';

type EmbeddableAIContextProviderProps = PropsWithChildren<AIConfig>;

/**
 * AI context provider for embeddable routes.
 * Merges the static site AI config with runtime embed configuration updates.
 */
export function EmbeddableAIContextProvider(props: EmbeddableAIContextProviderProps) {
    const { aiMode, suggestions, greeting, trademark, children } = props;
    const embedConfig = useEmbeddableConfiguration();

    return (
        <AIContextProvider
            aiMode={aiMode}
            suggestions={embedConfig.suggestions ?? suggestions}
            greeting={embedConfig.greeting ?? greeting}
            trademark={trademark && (embedConfig.trademark ?? true)}
            assistantName={embedConfig.assistantName?.substring(0, 32)} // Limit to 32 characters
        >
            {children}
        </AIContextProvider>
    );
}
