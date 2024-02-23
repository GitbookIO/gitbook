import { CustomizationThemeMode } from '@gitbook/api';
import { Metadata, Viewport } from 'next';
import React from 'react';
import * as ReactDOM from 'react-dom';

import { AdminToolbar } from '@/components/AdminToolbar';
import { CookiesToast } from '@/components/Cookies';
import { LoadIntegrations } from '@/components/Integrations';
import { SpaceLayout } from '@/components/SpaceLayout';
import { buildVersion } from '@/lib/build';
import { getContentSecurityPolicyNonce } from '@/lib/csp';
import { absoluteHref, baseUrl } from '@/lib/links';
import { shouldIndexSpace } from '@/lib/seo';

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
        customization,
        pages,
        collection,
        collectionSpaces,
        ancestors,
        scripts,
    } = await fetchSpaceData();

    scripts.forEach(({ script }) => {
        ReactDOM.preload(script, {
            as: 'script',
            nonce,
        });
    });

    return (
        <>
            <SpaceLayout
                space={space}
                collection={collection}
                collectionSpaces={collectionSpaces}
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

            <AdminToolbar space={space} content={content} />
        </>
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
    const { space, collection, customization } = await fetchSpaceData();
    const customIcon = 'icon' in customization.favicon ? customization.favicon.icon : null;

    return {
        title: `${space.title}`,
        generator: `GitBook (${buildVersion()})`,
        // We pass `metadataBase` to avoid warnings from Next, but we still use absolute URLs
        // as metadataBase doesn't seem to work well on next-on-cloudflare.
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
        robots: shouldIndexSpace({ space, collection }) ? 'index, follow' : 'noindex, nofollow',
    };
}
