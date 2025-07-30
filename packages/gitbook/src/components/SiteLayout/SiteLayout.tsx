import type { GitBookSiteContext } from '@/lib/context';
import { CustomizationThemeMode } from '@gitbook/api';
import type { Metadata, Viewport } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import React from 'react';
import * as ReactDOM from 'react-dom';

import { AdminToolbar } from '@/components/AdminToolbar';
import { CookiesToast } from '@/components/Cookies';
import { LoadIntegrations } from '@/components/Integrations';
import { SpaceLayout } from '@/components/SpaceLayout';
import type { VisitorAuthClaims } from '@/lib/adaptive';
import { buildVersion } from '@/lib/build';
import { GITBOOK_API_PUBLIC_URL, GITBOOK_ASSETS_URL, GITBOOK_ICONS_URL } from '@/lib/env';
import { getResizedImageURL } from '@/lib/images';
import { isSiteIndexable } from '@/lib/seo';
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
    visitorAuthClaims: VisitorAuthClaims;
    children: React.ReactNode;
}) {
    const { context, nonce, forcedTheme, withTracking, visitorAuthClaims, children } = props;

    const { customization } = context;
    // Scripts are disabled when tracking is disabled
    const scripts = withTracking ? context.scripts : [];

    ReactDOM.preconnect(GITBOOK_API_PUBLIC_URL);
    ReactDOM.preconnect(GITBOOK_ICONS_URL);
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
                contextId={context.contextId}
                forcedTheme={
                    forcedTheme ??
                    (customization.themes.toggeable ? undefined : customization.themes.default)
                }
                externalLinksTarget={customization.externalLinks.target}
            >
                <SpaceLayout
                    context={context}
                    withTracking={withTracking}
                    visitorAuthClaims={visitorAuthClaims}
                >
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
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
    };
}

export async function generateSiteLayoutMetadata(context: GitBookSiteContext): Promise<Metadata> {
    const { site, customization, linker, imageResizer } = context;
    const customIcon = 'icon' in customization.favicon ? customization.favicon.icon : null;

    const faviconSize = 48;
    const icons = await Promise.all(
        [
            {
                url: customIcon?.light
                    ? getResizedImageURL(imageResizer, customIcon.light, {
                          width: faviconSize,
                          height: faviconSize,
                      })
                    : linker.toAbsoluteURL(
                          linker.toPathInSpace('~gitbook/icon?size=small&theme=light')
                      ),
                type: 'image/png',
                media: '(prefers-color-scheme: light)',
            },
            {
                url: customIcon?.dark
                    ? getResizedImageURL(imageResizer, customIcon.dark, {
                          width: faviconSize,
                          height: faviconSize,
                      })
                    : linker.toAbsoluteURL(
                          linker.toPathInSpace('~gitbook/icon?size=small&theme=dark')
                      ),
                type: 'image/png',
                media: '(prefers-color-scheme: dark)',
            },
        ].map(async (icon) => ({
            ...icon,
            url: await icon.url,
        }))
    );

    return {
        title: site.title,
        generator: `GitBook (${buildVersion()})`,
        icons: {
            icon: icons,
            apple: icons,
        },
        appleWebApp: {
            capable: true,
            title: site.title,
            statusBarStyle:
                customization.themes.default === CustomizationThemeMode.Dark ? 'black' : 'default',
        },
        robots: (await isSiteIndexable(context)) ? 'index, follow' : 'noindex, nofollow',
    };
}
