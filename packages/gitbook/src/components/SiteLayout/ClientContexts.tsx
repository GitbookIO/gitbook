'use client';

import { CustomizationThemeMode } from '@gitbook/api';
import { ThemeProvider } from 'next-themes';
import React from 'react';

export function ClientContexts(props: {
    nonce: string;
    forcedTheme: CustomizationThemeMode | undefined;
    children: React.ReactNode;
}) {
    const { children, forcedTheme } = props;

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
            {children}
        </ThemeProvider>
    );
}
