'use client';

import type { CustomizationThemeMode, SiteExternalLinksTarget } from '@gitbook/api';
import { ThemeProvider } from 'next-themes';
import type React from 'react';
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
        <ThemeProvider attribute="class" enableSystem forcedTheme={forcedTheme}>
            <LinkSettingsContext.Provider value={{ externalLinksTarget }}>
                {children}
            </LinkSettingsContext.Provider>
        </ThemeProvider>
    );
}
