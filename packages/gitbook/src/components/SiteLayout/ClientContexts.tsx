'use client';

import type { CustomizationThemeMode, SiteExternalLinksTarget } from '@gitbook/api';
import { ThemeProvider } from 'next-themes';
import type React from 'react';
import { RouterCacheClearer } from '../hooks/useClearRouterCache';
import { Link, LinkSettingsContext } from '../primitives';

export function ClientContexts(props: {
    nonce?: string;
    forcedTheme: CustomizationThemeMode | undefined;
    externalLinksTarget: SiteExternalLinksTarget;
    contextId?: string;
    children: React.ReactNode;
}) {
    const { children, forcedTheme, externalLinksTarget, contextId } = props;

    /**
     * A bug in ThemeProvider is causing the nonce to be included incorrectly
     * on the client-side. Original issue: https://github.com/pacocoursey/next-themes/issues/218
     *
     * This is a workaround for it, until next-themes fixes it in their library. There is already
     * a PR: https://github.com/pacocoursey/next-themes/pull/223
     */
    const nonce = typeof window === 'undefined' || !props.nonce ? props.nonce : '';

    //TODO: Don't forget to remove these Links
    return (
        <ThemeProvider nonce={nonce} attribute="class" enableSystem forcedTheme={forcedTheme}>
            <LinkSettingsContext.Provider value={{ externalLinksTarget, contextId }}>
                <Link prefetch={false} href="?visitor.isDeveloper=true">
                    Is dev true
                </Link>
                <Link prefetch={false} href="?visitor.isDeveloper=false">
                    Is dev false
                </Link>
                <RouterCacheClearer />
                {children}
            </LinkSettingsContext.Provider>
        </ThemeProvider>
    );
}
