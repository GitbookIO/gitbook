import { CustomizationThemeMode } from '@gitbook/api';
import { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import React from 'react';
import * as ReactDOM from 'react-dom';

import { AdminToolbar } from '@/components/AdminToolbar';
import { CookiesToast } from '@/components/Cookies';
import { LoadIntegrations } from '@/components/Integrations';
import { SpaceLayout } from '@/components/SpaceLayout';
import { api } from '@/lib/api';
import { assetsDomain } from '@/lib/assets';
import { buildVersion } from '@/lib/build';
import { getContentSecurityPolicyNonce } from '@/lib/csp';
import { absoluteHref, baseUrl } from '@/lib/links';
import { shouldIndexSpace } from '@/lib/seo';
import { getContentTitle } from '@/lib/utils';

import { ClientContexts } from './ClientContexts';
import { RocketLoaderDetector } from './RocketLoaderDetector';
import { fetchSpaceData } from '../fetch';

export const runtime = 'edge';

/**
 * Layout when rendering the content.
 */
export default async function ContentLayout(props: { children: React.ReactNode }) {
    const { children } = props;

    const nonce = getContentSecurityPolicyNonce();
    const {
        content,
        space,
        contentTarget,
        customization,
        pages,
        parent,
        spaces,
        ancestors,
        scripts,
    } = await fetchSpaceData();

    ReactDOM.preconnect(api().endpoint);
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
        <ClientContexts
            nonce={nonce}
            forcedTheme={
                getQueryStringTheme() ??
                (customization.themes.toggeable ? undefined : customization.themes.default)
            }
        >
            <SpaceLayout
                space={space}
                contentTarget={contentTarget}
                parent={parent}
                spaces={spaces}
                customization={customization}
                pages={pages}
                ancestors={ancestors}
                content={content}
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

            <AdminToolbar space={space} content={content} />
        </ClientContexts>
    );
}

export async function generateViewport(): Promise<Viewport> {
    const { customization } = await fetchSpaceData();
    return {
        colorScheme: customization.themes.toggeable
            ? customization.themes.default === CustomizationThemeMode.Dark
                ? 'dark light'
                : 'light dark'
            : customization.themes.default,
    };
}

export async function generateMetadata(): Promise<Metadata> {
    const { space, parent, customization } = await fetchSpaceData();
    const customIcon = 'icon' in customization.favicon ? customization.favicon.icon : null;

    return {
        title: getContentTitle(space, customization, parent),
        generator: `GitBook (${buildVersion()})`,
        metadataBase: new URL(baseUrl()),
        icons: {
            icon: [
                {
                    url:
                        customIcon?.light ??
                        absoluteHref('~gitbook/icon?size=small&theme=light', true),
                    type: 'image/png',
                    media: '(prefers-color-scheme: light)',
                },
                {
                    url:
                        customIcon?.dark ??
                        absoluteHref('~gitbook/icon?size=small&theme=dark', true),
                    type: 'image/png',
                    media: '(prefers-color-scheme: dark)',
                },
            ],
        },
        robots: shouldIndexSpace({ space, parent }) ? 'index, follow' : 'noindex, nofollow',
    };
}

/**
 * For preview, the theme can be set via query string (?theme=light).
 */
function getQueryStringTheme() {
    const headersList = headers();
    const queryStringTheme = headersList.get('x-gitbook-theme');
    if (!queryStringTheme) {
        return null;
    }

    return queryStringTheme === 'light'
        ? CustomizationThemeMode.Light
        : CustomizationThemeMode.Dark;
}
