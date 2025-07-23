'use client';

import type React from 'react';

import { TranslateContext } from '@/intl/client';
import type { TranslationLanguage } from '@/intl/translations';
import { LoadingStateProvider } from '../primitives/LoadingStateProvider';

export function ClientContexts(props: {
    language: TranslationLanguage;
    children: React.ReactNode;
}) {
    const { children, language } = props;

    return (
        <TranslateContext.Provider value={language}>
            <LoadingStateProvider>{children}</LoadingStateProvider>
        </TranslateContext.Provider>
    );
}
