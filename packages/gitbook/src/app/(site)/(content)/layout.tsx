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
import { api } from '@/lib/api';
import { assetsDomain } from '@/lib/assets';
import { buildVersion } from '@/lib/build';
import { getContentSecurityPolicyNonce } from '@/lib/csp';
import { GitBookContext, getGitBookContextFromHeaders } from '@/lib/gitbook-context';
import { getAbsoluteHref, getBaseUrl } from '@/lib/links';
import { isSpaceIndexable } from '@/lib/seo';
import { getContentTitle } from '@/lib/utils';

import { ClientContexts } from './ClientContexts';
import { RocketLoaderDetector } from './RocketLoaderDetector';
import { fetchContentData } from '../fetch';

export const runtime = 'edge';

/**
 * Layout when rendering the content.
 */
export default async function ContentLayout(props: { children: React.ReactNode }) {
    const ctx = getGitBookContextFromHeaders(await headers());
    const { children } = props;

    const nonce = getContentSecurityPolicyNonce(ctx);
    const {
        content,
        space,
        contentTarget,
        customization,
        pages,
        site,
        spaces,
        ancestors,
        scripts,
        sections,
    } = await fetchContentData(ctx);

    ReactDOM.preconnect(api(ctx).client.endpoint);
    if (assetsDomain) {
        ReactDOM.preconnect(assetsDomain);
    }

    scripts.forEach(({ script }) => {
        ReactDOM.preload(script, {
            as: 'script',
            nonce,
        });
    });

    const queryStringTheme = getQueryStringTheme(ctx);

    return (
        <NuqsAdapter>
            <ClientContexts
                nonce={nonce}
                forcedTheme={
                    queryStringTheme ??
                    (customization.themes.toggeable ? undefined : customization.themes.default)
                }
            >
                <SpaceLayout
                    space={space}
                    contentTarget={contentTarget}
                    site={site}
                    spaces={spaces}
                    sections={sections}
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
        </NuqsAdapter>
    );
}

export async function generateViewport(): Promise<Viewport> {
    const ctx = getGitBookContextFromHeaders(await headers());
    const { customization } = await fetchContentData(ctx);
    return {
        colorScheme: customization.themes.toggeable
            ? customization.themes.default === CustomizationThemeMode.Dark
                ? 'dark light'
                : 'light dark'
            : customization.themes.default,
    };
}

export async function generateMetadata(): Promise<Metadata> {
    const ctx = getGitBookContextFromHeaders(await headers());
    const { space, site, customization } = await fetchContentData(ctx);
    const customIcon = 'icon' in customization.favicon ? customization.favicon.icon : null;

    return {
        title: getContentTitle(space, customization, site),
        generator: `GitBook (${buildVersion()})`,
        metadataBase: new URL(getBaseUrl(ctx)),
        icons: {
            icon: [
                {
                    url:
                        customIcon?.light ??
                        getAbsoluteHref(ctx, '~gitbook/icon?size=small&theme=light', true),
                    type: 'image/png',
                    media: '(prefers-color-scheme: light)',
                },
                {
                    url:
                        customIcon?.dark ??
                        getAbsoluteHref(ctx, '~gitbook/icon?size=small&theme=dark', true),
                    type: 'image/png',
                    media: '(prefers-color-scheme: dark)',
                },
            ],
        },
        robots: isSpaceIndexable(ctx, { space, site }) ? 'index, follow' : 'noindex, nofollow',
    };
}

/**
 * For preview, the theme can be set via query string (?theme=light).
 */
function getQueryStringTheme(ctx: GitBookContext) {
    if (!ctx.theme) {
        return null;
    }

    return ctx.theme === 'light' ? CustomizationThemeMode.Light : CustomizationThemeMode.Dark;
}
