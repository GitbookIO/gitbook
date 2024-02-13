import { CustomizationThemeMode } from '@gitbook/api';
import { Metadata, Viewport } from 'next';
import Script from 'next/script';
import React from 'react';

import { AdminToolbar } from '@/components/AdminToolbar';
import { CookiesToast } from '@/components/Cookies';
import { SpaceLayout } from '@/components/SpaceLayout';
import { buildVersion } from '@/lib/build';
import { getContentSecurityPolicyNonce } from '@/lib/csp';
import { absoluteHref, baseUrl } from '@/lib/links';
import { shouldIndexSpace } from '@/lib/seo';

import { SpaceParams, fetchSpaceData } from '../fetch';

export const runtime = 'edge';

/**
 * Layout when rendering the content.
 */
export default async function ContentLayout(props: {
    params: SpaceParams;
    children: React.ReactNode;
}) {
    const { params, children } = props;

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
    } = await fetchSpaceData(params);

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

            {scripts.map(({ script }) => (
                <Script key={script} src={script} strategy="lazyOnload" nonce={nonce} />
            ))}

            {scripts.some((script) => script.cookies) || customization.privacyPolicy.url ? (
                <React.Suspense fallback={null}>
                    <CookiesToast privacyPolicy={customization.privacyPolicy.url} />
                </React.Suspense>
            ) : null}

            <AdminToolbar space={space} content={content} />
        </>
    );
}

export async function generateViewport({ params }: { params: SpaceParams }): Promise<Viewport> {
    const { customization } = await fetchSpaceData(params);
    return {
        colorScheme: customization.themes.toggeable
            ? customization.themes.default === CustomizationThemeMode.Dark
                ? 'dark light'
                : 'light dark'
            : customization.themes.default,
    };
}

export async function generateMetadata({ params }: { params: SpaceParams }): Promise<Metadata> {
    const { space, collection, customization } = await fetchSpaceData(params);
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
