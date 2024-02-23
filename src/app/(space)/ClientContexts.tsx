'use client';

import { CustomizationThemeMode } from '@gitbook/api';
import { ThemeProvider } from 'next-themes';
import React from 'react';
import { RecoilRoot } from 'recoil';

import { TranslateContext } from '@/intl/client';
import { TranslationLanguage } from '@/intl/translations';

export function ClientContexts(props: {
    nonce: string;
    language: TranslationLanguage;
    forcedTheme: CustomizationThemeMode | undefined;
    children: React.ReactNode;
}) {
    const { nonce, children, forcedTheme, language } = props;

    return (
        <ThemeProvider nonce={nonce} attribute="class" enableSystem forcedTheme={forcedTheme}>
            <RecoilRoot>
                <TranslateContext.Provider value={language}>{children}</TranslateContext.Provider>
            </RecoilRoot>
        </ThemeProvider>
    );
}
