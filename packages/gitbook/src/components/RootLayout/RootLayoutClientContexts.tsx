'use client';

import type React from 'react';

import { TranslateContext } from '@/intl/client';
import type { TranslationLanguage } from '@/intl/translations';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { HashProvider } from '../hooks';
import { LoadingStateProvider } from '../primitives/LoadingStateProvider';

/**
 * Client component context providers for the root layout.
 */
export function RootLayoutClientContexts(props: {
    language: TranslationLanguage;
    children: React.ReactNode;
}) {
    const { children, language } = props;

    return (
        <TranslateContext.Provider value={language}>
            <TooltipProvider delayDuration={200}>
                <HashProvider>
                    <LoadingStateProvider>{children}</LoadingStateProvider>
                </HashProvider>
            </TooltipProvider>
        </TranslateContext.Provider>
    );
}
