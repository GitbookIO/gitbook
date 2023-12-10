import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { SpaceContent } from '@/components/SpaceContent';
import { getDocument } from '@/lib/api';
import { PageHrefContext, baseUrl, pageHref } from '@/lib/links';
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
        description: page.description,
        generator: 'GitBook',
        metadataBase: new URL(baseUrl()),
        icons: {
            icon: [
                {
                    url: customIcon?.light ?? '.gitbook/icon?size=small&theme=light',
                    type: 'image/png',
                    media: '(prefers-color-scheme: light)',
                },
                {
                    url: customIcon?.dark ?? '.gitbook/icon?size=small&theme=dark',
                    type: 'image/png',
                    media: '(prefers-color-scheme: dark)',
                },
            ],
        },
        openGraph: {
            images: [customization.socialPreview.url ?? `.gitbook/ogimage/${page.id}`],
        },
        robots: space.visibility === 'public' ? 'index, follow' : 'noindex, nofollow',
    };
}
