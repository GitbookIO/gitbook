import { CustomizationThemeMode } from '@gitbook/api';
import { Metadata, Viewport } from 'next';
import { notFound, redirect } from 'next/navigation';
import Script from 'next/script';
import React from 'react';

import { CookiesToast } from '@/components/Cookies';
import { SpaceContent } from '@/components/SpaceContent';
import { getContentSecurityPolicyNonce } from '@/lib/csp';
import { PageHrefContext, absoluteHref, baseUrl, pageHref } from '@/lib/links';
import { getPagePath } from '@/lib/pages';
import { shouldIndexSpace } from '@/lib/seo';

import { PagePathParams, fetchPageData, getPathnameParam } from '../fetch';

export const runtime = 'edge';

/**
 * Fetch and render a page.
 */
export default async function Page(props: { params: PagePathParams }) {
    const { params } = props;

    const nonce = getContentSecurityPolicyNonce();
    const {
        content,
        space,
        customization,
        pages,
        page,
        collection,
        collectionSpaces,
        ancestors,
        document,
        scripts,
    } = await fetchPageData(params);
    const linksContext: PageHrefContext = {};

    if (!page) {
        notFound();
    } else if (getPagePath(pages, page) !== getPathnameParam(params)) {
        redirect(pageHref(pages, page, linksContext));
    }

    return (
        <>
            <SpaceContent
                content={content}
                space={space}
                customization={customization}
                pages={pages}
                page={page}
                ancestors={ancestors}
                document={document}
                collection={collection}
                collectionSpaces={collectionSpaces}
            />

            {scripts.map(({ script }) => (
                <Script key={script} src={script} strategy="lazyOnload" nonce={nonce} />
            ))}

            {scripts.some((script) => script.cookies) || customization.privacyPolicy.url ? (
                <React.Suspense fallback={null}>
                    <CookiesToast privacyPolicy={customization.privacyPolicy.url} />
                </React.Suspense>
            ) : null}
        </>
    );
}

export async function generateViewport({ params }: { params: PagePathParams }): Promise<Viewport> {
    const { customization } = await fetchPageData(params);
    return {
        colorScheme: customization.themes.toggeable
            ? customization.themes.default === CustomizationThemeMode.Dark
                ? 'dark light'
                : 'light dark'
            : customization.themes.default,
    };
}

export async function generateMetadata({ params }: { params: PagePathParams }): Promise<Metadata> {
    const { space, collection, page, customization } = await fetchPageData(params);
    if (!page) {
        notFound();
    }

    const customIcon = 'icon' in customization.favicon ? customization.favicon.icon : null;

    return {
        title: `${page.title} | ${space.title}`,
        description: page.description ?? '',
        generator: 'GitBook',
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
        openGraph: {
            images: [
                customization.socialPreview.url ?? absoluteHref(`~gitbook/ogimage/${page.id}`),
            ],
        },
        robots: shouldIndexSpace({ space, collection }) ? 'index, follow' : 'noindex, nofollow',
    };
}
