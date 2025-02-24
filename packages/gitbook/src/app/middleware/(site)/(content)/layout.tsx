import { CustomizationThemeMode } from '@gitbook/api';
import { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import React from 'react';
import * as ReactDOM from 'react-dom';

import { AdminToolbar } from '@/components/AdminToolbar';
import { CookiesToast } from '@/components/Cookies';
import { LoadIntegrations } from '@/components/Integrations';
import { SpaceLayout } from '@/components/SpaceLayout';
import { assetsDomain } from '@/lib/assets';
import { buildVersion } from '@/lib/build';
import { getContentSecurityPolicyNonce } from '@/lib/csp';
import { getAbsoluteHref, getBaseUrl } from '@/lib/links';
import { isSpaceIndexable } from '@/lib/seo';
import { getContentTitle } from '@/lib/utils';

import { ClientContexts } from './ClientContexts';
import { RocketLoaderDetector } from './RocketLoaderDetector';
import { fetchContentData } from '../fetch';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * Layout when rendering the content.
 */
export default async function ContentLayout(props: { children: React.ReactNode }) {
    const { children } = props;

    const nonce = await getContentSecurityPolicyNonce();
    const context = await fetchContentData();

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

    const queryStringTheme = await getQueryStringTheme();

    return (
        <NuqsAdapter>
            <ClientContexts
                nonce={nonce}
                forcedTheme={
                    queryStringTheme ??
                    (customization.themes.toggeable ? undefined : customization.themes.default)
                }
            >
                <SpaceLayout context={context}>{children}</SpaceLayout>

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

export async function generateViewport(): Promise<Viewport> {
    const { customization } = await fetchContentData();
    return {
        colorScheme: customization.themes.toggeable
            ? customization.themes.default === CustomizationThemeMode.Dark
                ? 'dark light'
                : 'light dark'
            : customization.themes.default,
    };
}

export async function generateMetadata(): Promise<Metadata> {
    const { space, site, customization } = await fetchContentData();
    const customIcon = 'icon' in customization.favicon ? customization.favicon.icon : null;

    return {
        title: getContentTitle(space, customization, site),
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
        robots: (await isSpaceIndexable({ space, site })) ? 'index, follow' : 'noindex, nofollow',
    };
}

/**
 * For preview, the theme can be set via query string (?theme=light).
 */
async function getQueryStringTheme() {
    const headersList = await headers();
    const queryStringTheme = headersList.get('x-gitbook-theme');
    if (!queryStringTheme) {
        return null;
    }

    return queryStringTheme === 'light'
        ? CustomizationThemeMode.Light
        : CustomizationThemeMode.Dark;
}
