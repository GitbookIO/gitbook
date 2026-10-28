'use client';

import { Tooltip } from '@base-ui/react/tooltip';
import type React from 'react';

import { NavigationStatusProvider, ScrollPage } from '../hooks';
import { LoadingStateProvider } from '../primitives/LoadingStateProvider';
import { TranslateContext } from '@/intl/client';
import type { TranslationLanguage } from '@/intl/translations';

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
            <Tooltip.Provider delay={200}>
                <NavigationStatusProvider>
                    <LoadingStateProvider>{children}</LoadingStateProvider>
                    <ScrollPage />
                </NavigationStatusProvider>
            </Tooltip.Provider>
        </TranslateContext.Provider>
    );
}
