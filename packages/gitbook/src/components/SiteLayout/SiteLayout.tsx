import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import React from 'react';
import * as ReactDOM from 'react-dom';

import { CustomizationDefaultThemeMode } from '@gitbook/api';

import { AIContextProvider } from '../AI';
import { Announcement } from '../Announcement';
import { RocketLoaderDetector } from './RocketLoaderDetector';
import { SiteLayoutClientContexts } from './SiteLayoutClientContexts';
import { AdminToolbar } from '@/components/AdminToolbar';
import { CookiesToast } from '@/components/Cookies';
import { Footer } from '@/components/Footer';
import { LoadIntegrations } from '@/components/Integrations';
import { SpaceHeader, SpaceLayout, SpaceTableOfContents } from '@/components/SpaceLayout';
import type { VisitorAuthClaims } from '@/lib/adaptive';
import { buildVersion } from '@/lib/build';
import type { GitBookSiteContext, GitBookSiteScopeContext } from '@/lib/context';
import { GITBOOK_API_PUBLIC_URL, GITBOOK_ASSETS_URL, GITBOOK_ICONS_URL } from '@/lib/env';
import { getResizedImageURL } from '@/lib/images';
import { isSiteIndexable } from '@/lib/seo';

// Pure trackers with no visitor-facing UI, safe to load after `load` + idle. Anything not
// listed (consent managers, chats, assistants…) keeps loading eagerly.
const DEFERRABLE_TRACKING_INTEGRATIONS = new Set([
    'ahrefs',
    'amplitude',
    'fathom',
    'fullstory',
    'googleanalytics',
    'heap',
    'koala',
    'marketo',
    'mixpanel',
    'piwik',
    'plausible',
    'reo',
    'salesviewer',
    'unify',
    'zoominfo',
]);

function isDeferrableScript(script: string): boolean {
    const name = script.match(/\/v1\/integrations\/([^/]+)\//)?.[1];
    return name !== undefined && DEFERRABLE_TRACKING_INTEGRATIONS.has(name);
}

/**
 * Parts of the layout that can only be rendered from a full site context, as they read the
 * revision. A site scope context has to provide them itself.
 */
export type SiteLayoutSlots = {
    announcement: React.ReactNode;
    header: React.ReactNode;
    tableOfContents: React.ReactNode;
    footer: React.ReactNode;
    adminToolbar: React.ReactNode;
};

/**
 * Build the default slots of the layout from a full site context.
 */
export function getSiteLayoutSlots(context: GitBookSiteContext): SiteLayoutSlots {
    return {
        announcement: <Announcement context={context} />,
        header: <SpaceHeader context={context} />,
        tableOfContents: <SpaceTableOfContents context={context} />,
        footer: <Footer context={context} />,
        adminToolbar: <AdminToolbar context={context} />,
    };
}

type SiteLayoutProps = {
    forcedTheme?: CustomizationDefaultThemeMode | null;
    withTracking: boolean;
    visitorAuthClaims: VisitorAuthClaims;
    children: React.ReactNode;
    clientNavigationSelection?: boolean;
} & (
    | {
          context: GitBookSiteContext;
          /** Overrides of the slots that would otherwise be rendered from the context. */
          slots?: Partial<SiteLayoutSlots>;
      }
    | {
          context: GitBookSiteScopeContext;
          /** A site scope context can't render any of them, so they are all required. */
          slots: SiteLayoutSlots;
      }
);

/**
 * Layout when rendering a site.
 */
export async function SiteLayout(props: SiteLayoutProps) {
    const {
        context,
        forcedTheme,
        withTracking,
        visitorAuthClaims,
        children,
        clientNavigationSelection,
    } = props;

    // The prop type guarantees `slots` is complete whenever the context can't build them itself.
    const slots = {
        ...('revision' in context ? getSiteLayoutSlots(context) : null),
        ...props.slots,
    } as SiteLayoutSlots;

    const { customization } = context;
    const { ai } = customization;
    const aiGreeting = (context.locale && ai?.localizedGreeting?.[context.locale]) ?? ai?.greeting;
    // Scripts are disabled when tracking is disabled
    const scripts = withTracking ? context.scripts : [];

    ReactDOM.preconnect(GITBOOK_API_PUBLIC_URL);
    ReactDOM.preconnect(GITBOOK_ICONS_URL);
    if (GITBOOK_ASSETS_URL) {
        ReactDOM.preconnect(GITBOOK_ASSETS_URL);
    }

    // Start the search-index download from the HTML itself. `crossOrigin` must match the
    // client `fetch()` (cors + same-origin credentials) or the preload is ignored and the
    // index downloads twice — the omission was exactly that bug before.
    ReactDOM.preload(`${context.linker.siteBasePath}~gitbook/site-index`, {
        as: 'fetch',
        type: 'application/json',
        crossOrigin: 'anonymous',
    });

    scripts.forEach(({ script }) => {
        if (!isDeferrableScript(script)) {
            ReactDOM.preload(script, {
                as: 'script',
            });
        }
    });

    return (
        <SiteLayoutClientContexts
            contextId={context.contextId}
            forcedTheme={
                forcedTheme ??
                // Only force concrete light/dark; System stays unforced so next-themes resolves prefers-color-scheme pre-paint (avoids the flash). A theme saved while the toggle was previously on still wins — see the PR's "Known limitation". RND-11643
                (customization.themes.toggeable ||
                customization.themes.default === CustomizationDefaultThemeMode.System
                    ? undefined
                    : customization.themes.default)
            }
            defaultTheme={customization.themes.default}
            externalLinksTarget={customization.externalLinks.target}
            proxyOrigin={context.site.proxy?.origin}
        >
            <AIContextProvider
                aiMode={customization.ai?.mode}
                suggestions={context.customization.ai?.suggestions}
                trademark={customization.trademark.enabled}
                greeting={aiGreeting ? { subtitle: aiGreeting } : undefined}
            >
                <SpaceLayout
                    context={context}
                    withTracking={withTracking}
                    visitorAuthClaims={visitorAuthClaims}
                    announcementSlot={slots.announcement}
                    headerSlot={slots.header}
                    tableOfContentsSlot={slots.tableOfContents}
                    footerSlot={slots.footer}
                    clientNavigationSelection={clientNavigationSelection}
                >
                    {children}
                </SpaceLayout>
            </AIContextProvider>

            <LoadIntegrations />
            {scripts.map(({ script }) =>
                isDeferrableScript(script) ? (
                    <Script key={script} src={script} strategy="lazyOnload" />
                ) : (
                    <script key={script} async src={script} />
                )
            )}

            {scripts.some((script) => script.cookies) || customization.privacyPolicy.url ? (
                <React.Suspense fallback={null}>
                    <CookiesToast privacyPolicy={customization.privacyPolicy.url} />
                </React.Suspense>
            ) : null}

            <RocketLoaderDetector />

            {slots.adminToolbar}
        </SiteLayoutClientContexts>
    );
}

export async function generateSiteLayoutViewport(
    context: GitBookSiteContext | GitBookSiteScopeContext
): Promise<Viewport> {
    const { customization } = context;
    return {
        colorScheme: customization.themes.toggeable
            ? customization.themes.default === CustomizationDefaultThemeMode.Dark
                ? 'dark light'
                : 'light dark'
            : customization.themes.default === CustomizationDefaultThemeMode.Dark
              ? 'dark'
              : customization.themes.default === CustomizationDefaultThemeMode.Light
                ? 'light'
                : 'light dark', // 'system' → let browser decide based on OS preference
        width: 'device-width',
        initialScale: 1,
        viewportFit: 'cover',
    };
}

export async function generateSiteLayoutMetadata(
    context: GitBookSiteContext | GitBookSiteScopeContext
): Promise<Metadata> {
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
                customization.themes.default === CustomizationDefaultThemeMode.Dark
                    ? 'black'
                    : 'default',
        },
        robots: isSiteIndexable(context) ? 'index, follow' : 'noindex, nofollow',
    };
}
