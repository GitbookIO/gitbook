'use client';

import type { CustomizationThemeMode, SiteExternalLinksTarget } from '@gitbook/api';
import { ThemeProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import type React from 'react';
import { SearchContextProvider } from '../Search';
import { useClearRouterCache } from '../hooks/useClearRouterCache';
import { LinkSettingsContext } from '../primitives';

/**
 * Client component context providers for the site layout.
 */
export function SiteLayoutClientContexts(props: {
    forcedTheme: CustomizationThemeMode | undefined;
    externalLinksTarget: SiteExternalLinksTarget;
    contextId: string | undefined;
    children: React.ReactNode;
}) {
    const { children, forcedTheme, externalLinksTarget, contextId } = props;

    useClearRouterCache(contextId);

    return (
        <ThemeProvider
            attribute="class"
            disableTransitionOnChange
            enableSystem
            forcedTheme={forcedTheme}
        >
            <NuqsAdapter>
                <LinkSettingsContext.Provider value={{ externalLinksTarget }}>
                    <SearchContextProvider>{children}</SearchContextProvider>
                </LinkSettingsContext.Provider>
            </NuqsAdapter>
        </ThemeProvider>
    );
}
