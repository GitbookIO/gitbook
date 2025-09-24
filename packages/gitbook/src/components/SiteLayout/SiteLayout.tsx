import type { GitBookSiteContext } from '@/lib/context';
import { CustomizationThemeMode } from '@gitbook/api';
import type { Metadata, Viewport } from 'next';
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
import { AIContextProvider } from '../AI';
import { RocketLoaderDetector } from './RocketLoaderDetector';
import { SiteLayoutClientContexts } from './SiteLayoutClientContexts';

/**
 * Layout when rendering a site.
 */
export async function SiteLayout(props: {
    context: GitBookSiteContext;
    forcedTheme?: CustomizationThemeMode | null;
    withTracking: boolean;
    visitorAuthClaims: VisitorAuthClaims;
    children: React.ReactNode;
}) {
    const { context, forcedTheme, withTracking, visitorAuthClaims, children } = props;

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
        });
    });

    return (
        <SiteLayoutClientContexts
            contextId={context.contextId}
            forcedTheme={
                forcedTheme ??
                (customization.themes.toggeable ? undefined : customization.themes.default)
            }
            externalLinksTarget={customization.externalLinks.target}
        >
            <AIContextProvider
                aiMode={customization.ai?.mode}
                trademark={customization.trademark.enabled}
            >
                <SpaceLayout
                    context={context}
                    withTracking={withTracking}
                    visitorAuthClaims={visitorAuthClaims}
                >
                    {children}
                </SpaceLayout>
            </AIContextProvider>

            {scripts.length > 0 ? (
                <>
                    <LoadIntegrations />
                    {scripts.map(({ script }) => (
                        <script key={script} async src={script} />
                    ))}
                </>
            ) : null}

            {scripts.some((script) => script.cookies) || customization.privacyPolicy.url ? (
                <React.Suspense fallback={null}>
                    <CookiesToast privacyPolicy={customization.privacyPolicy.url} />
                </React.Suspense>
            ) : null}

            <RocketLoaderDetector />

            <AdminToolbar context={context} />
        </SiteLayoutClientContexts>
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
    const appIconSize = 180;

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

    const appIcons = await Promise.all(
        [
            {
                url: customIcon?.light
                    ? getResizedImageURL(imageResizer, customIcon.light, {
                          width: appIconSize,
                          height: appIconSize,
                      })
                    : linker.toAbsoluteURL(
                          linker.toPathInSpace('~gitbook/icon?size=medium&theme=light&border=false')
                      ),
                type: 'image/png',
                media: '(prefers-color-scheme: light)',
            },
            {
                url: customIcon?.dark
                    ? getResizedImageURL(imageResizer, customIcon.dark, {
                          width: appIconSize,
                          height: appIconSize,
                      })
                    : linker.toAbsoluteURL(
                          linker.toPathInSpace('~gitbook/icon?size=medium&theme=dark&border=false')
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
            apple: appIcons,
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
