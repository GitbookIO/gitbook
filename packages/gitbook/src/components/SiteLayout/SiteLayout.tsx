import { CustomizationThemeMode } from '@gitbook/api';
import type { GitBookSiteContext } from '@v2/lib/context';
import type { Metadata, Viewport } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import React from 'react';
import * as ReactDOM from 'react-dom';

import { AdminToolbar } from '@/components/AdminToolbar';
import { CookiesToast } from '@/components/Cookies';
import { LoadIntegrations } from '@/components/Integrations';
import { SpaceLayout } from '@/components/SpaceLayout';
import { buildVersion } from '@/lib/build';
import { isSiteIndexable } from '@/lib/seo';

import { GITBOOK_API_URL, GITBOOK_ASSETS_URL } from '@v2/lib/env';
import { ClientContexts } from './ClientContexts';
import { RocketLoaderDetector } from './RocketLoaderDetector';

/**
 * Layout when rendering a site.
 */
export async function SiteLayout(props: {
    nonce?: string;
    context: GitBookSiteContext;
    forcedTheme?: CustomizationThemeMode | null;
    withTracking: boolean;
    children: React.ReactNode;
}) {
    const { context, nonce, forcedTheme, withTracking, children } = props;

    const { scripts, customization } = context;

    ReactDOM.preconnect(GITBOOK_API_URL);
    if (GITBOOK_ASSETS_URL) {
        ReactDOM.preconnect(GITBOOK_ASSETS_URL);
    }

    scripts.forEach(({ script }) => {
        ReactDOM.preload(script, {
            as: 'script',
            nonce,
        });
    });

    return (
        <NuqsAdapter>
            <ClientContexts
                nonce={nonce}
                forcedTheme={
                    forcedTheme ??
                    (customization.themes.toggeable ? undefined : customization.themes.default)
                }
            >
                <SpaceLayout context={context} withTracking={withTracking}>
                    {children}
                </SpaceLayout>

                {scripts.length > 0 ? (
                    <>
                        <LoadIntegrations />
                        {scripts.map(({ script }) => (
                            <script key={script} async src={script} nonce={nonce} />
                        ))}
                    </>
                ) : null}

                {scripts.some((script) => script.cookies) || customization.privacyPolicy.url ? (
                    <React.Suspense fallback={null}>
                        <CookiesToast privacyPolicy={customization.privacyPolicy.url} />
                    </React.Suspense>
                ) : null}

                <RocketLoaderDetector nonce={nonce} />

                <AdminToolbar context={context} />
            </ClientContexts>
        </NuqsAdapter>
    );
}

export async function generateSiteLayoutViewport(context: GitBookSiteContext): Promise<Viewport> {
    const { customization } = context;
    return {
        colorScheme: customization.themes.toggeable
            ? customization.themes.default === CustomizationThemeMode.Dark
                ? 'dark light'
                : 'light dark'
            : customization.themes.default,
    };
}

export async function generateSiteLayoutMetadata(context: GitBookSiteContext): Promise<Metadata> {
    const { site, customization, linker } = context;
    const customIcon = 'icon' in customization.favicon ? customization.favicon.icon : null;

    return {
        title: site.title,
        generator: `GitBook (${buildVersion()})`,
        // metadataBase: new URL(await getBaseUrl()),
        icons: {
            icon: [
                {
                    url:
                        customIcon?.light ??
                        linker.toAbsoluteURL(
                            linker.toPathInContent('~gitbook/icon?size=small&theme=light')
                        ),
                    type: 'image/png',
                    media: '(prefers-color-scheme: light)',
                },
                {
                    url:
                        customIcon?.dark ??
                        linker.toAbsoluteURL(
                            linker.toPathInContent('~gitbook/icon?size=small&theme=dark')
                        ),
                    type: 'image/png',
                    media: '(prefers-color-scheme: dark)',
                },
            ],
        },
        robots: (await isSiteIndexable(context)) ? 'index, follow' : 'noindex, nofollow',
    };
}
