import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { SpaceContent } from '@/components/SpaceContent';
import { getDocument } from '@/lib/api';
import { PageHrefContext, absoluteHref, baseUrl, pageHref } from '@/lib/links';
import { getPagePath } from '@/lib/pages';

import { PagePathParams, fetchPageData, getPathnameParam } from '../fetch';

export const runtime = 'edge';

/**
 * Fetch and render a page.
 */
export default async function Page(props: { params: PagePathParams }) {
    const { params } = props;

    const { content, space, customization, pages, page, collection, collectionSpaces, ancestors } =
        await fetchPageData(params);
    const linksContext: PageHrefContext = {};

    if (!page) {
        notFound();
    } else if (getPagePath(pages, page) !== getPathnameParam(params)) {
        redirect(pageHref(pages, page, linksContext));
    }

    const document = page.documentId ? await getDocument(space.id, page.documentId) : null;

    return (
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
    );
}

export async function generateMetadata({ params }: { params: PagePathParams }): Promise<Metadata> {
    const { space, page, customization } = await fetchPageData(params);
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
                        absoluteHref('.gitbook/icon?size=small&theme=light', true),
                    type: 'image/png',
                    media: '(prefers-color-scheme: light)',
                },
                {
                    url:
                        customIcon?.dark ??
                        absoluteHref('.gitbook/icon?size=small&theme=dark', true),
                    type: 'image/png',
                    media: '(prefers-color-scheme: dark)',
                },
            ],
        },
        openGraph: {
            images: [
                customization.socialPreview.url ?? absoluteHref(`.gitbook/ogimage/${page.id}`),
            ],
        },
        // TODO: remove once the development is finished
        robots: space.visibility === 'public' && 0 ? 'index, follow' : 'noindex, nofollow',
    };
}
