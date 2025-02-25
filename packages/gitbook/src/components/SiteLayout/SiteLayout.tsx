import { CustomizationThemeMode } from '@gitbook/api';
import { GitBookSiteContext } from '@v2/lib/context';
import { Metadata, Viewport } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import React from 'react';
import * as ReactDOM from 'react-dom';

import { AdminToolbar } from '@/components/AdminToolbar';
import { CookiesToast } from '@/components/Cookies';
import { LoadIntegrations } from '@/components/Integrations';
import { SpaceLayout } from '@/components/SpaceLayout';
import { assetsDomain } from '@/lib/assets';
import { buildVersion } from '@/lib/build';
import { getAbsoluteHref, getBaseUrl } from '@/lib/links';
import { isSiteIndexable } from '@/lib/seo';

import { ClientContexts } from './ClientContexts';
import { RocketLoaderDetector } from './RocketLoaderDetector';

/**
 * Layout when rendering a site.
 */
export async function SiteLayout(props: {
    nonce: string;
    context: GitBookSiteContext;
    forcedTheme?: CustomizationThemeMode | null;
    withTracking: boolean;
    children: React.ReactNode;
}) {
    const { context, nonce, forcedTheme, withTracking, children } = props;

    const { scripts, customization } = context;

    ReactDOM.preconnect(context.dataFetcher.apiEndpoint);
    if (assetsDomain) {
        ReactDOM.preconnect(assetsDomain);
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
    const { site, customization } = context;
    const customIcon = 'icon' in customization.favicon ? customization.favicon.icon : null;

    return {
        title: site.title,
        generator: `GitBook (${buildVersion()})`,
        metadataBase: new URL(await getBaseUrl()),
        icons: {
            icon: [
                {
                    url:
                        customIcon?.light ??
                        (await getAbsoluteHref('~gitbook/icon?size=small&theme=light', true)),
                    type: 'image/png',
                    media: '(prefers-color-scheme: light)',
                },
                {
                    url:
                        customIcon?.dark ??
                        (await getAbsoluteHref('~gitbook/icon?size=small&theme=dark', true)),
                    type: 'image/png',
                    media: '(prefers-color-scheme: dark)',
                },
            ],
        },
        robots: (await isSiteIndexable(site)) ? 'index, follow' : 'noindex, nofollow',
    };
}
