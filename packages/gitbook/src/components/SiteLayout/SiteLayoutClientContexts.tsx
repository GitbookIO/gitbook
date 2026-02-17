'use client';

import type { CustomizationThemeMode, SiteExternalLinksTarget } from '@gitbook/api';
import { ThemeProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import type React from 'react';
import { useMemo } from 'react';
import { SearchContextProvider } from '../Search';
import { useClearRouterCache } from '../hooks/useClearRouterCache';
import { LinkContext, type LinkContextType } from '../primitives';
import { isExternalLink } from '../utils/link';

/**
 * Client component context providers for the site layout.
 */
export function SiteLayoutClientContexts(props: {
    forcedTheme: CustomizationThemeMode | undefined;
    externalLinksTarget: SiteExternalLinksTarget;
    contextId: string | undefined;
    proxyOrigin: string | undefined;
    children: React.ReactNode;
}) {
    const { children, forcedTheme, externalLinksTarget, contextId, proxyOrigin } = props;

    useClearRouterCache(contextId);

    const linkContext: LinkContextType = useMemo(
        () => ({
            externalTarget: { self: '_self' as const, blank: '_blank' as const }[
                externalLinksTarget
            ],
            isExternalServer: (href) =>
                isExternalLink(href, proxyOrigin ? `https://${proxyOrigin}` : null),
            isExternalClient: (href) => {
                if (proxyOrigin?.startsWith(window.location.origin)) {
                    return isExternalLink(href, `https://${proxyOrigin}`);
                }
                return isExternalLink(href, window.location.origin);
            },
        }),
        [externalLinksTarget, proxyOrigin]
    );

    return (
        <ThemeProvider
            attribute="class"
            disableTransitionOnChange
            enableSystem
            forcedTheme={forcedTheme}
        >
            <NuqsAdapter>
                <LinkContext.Provider value={linkContext}>
                    <SearchContextProvider>{children}</SearchContextProvider>
                </LinkContext.Provider>
            </NuqsAdapter>
        </ThemeProvider>
    );
}
