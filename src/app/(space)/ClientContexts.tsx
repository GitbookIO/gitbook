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
    const { children, forcedTheme, language } = props;

    /**
     * A bug in ThemeProvider is causing the nonce to be included incorrectly
     * on the client-side. Original issue: https://github.com/pacocoursey/next-themes/issues/218
     *
     * This is a workaround for it, until next-themes fixes it in their library. There is already
     * a PR: https://github.com/pacocoursey/next-themes/pull/223
     */
    const nonce = typeof window === 'undefined' ? props.nonce : '';

    return (
        <ThemeProvider nonce={nonce} attribute="class" enableSystem forcedTheme={forcedTheme}>
            <RecoilRoot>
                <TranslateContext.Provider value={language}>{children}</TranslateContext.Provider>
            </RecoilRoot>
        </ThemeProvider>
    );
}
