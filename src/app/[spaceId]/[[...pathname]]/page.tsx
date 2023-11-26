import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { SpaceContent } from '@/components/SpaceContent';
import { getPageDocument } from '@/lib/api';
import { PageHrefContext, absoluteHref, baseUrl, pageHref } from '@/lib/links';

import { PagePathParams, fetchPageData, getPagePath } from '../fetch';

// Should be edge, but there is an error with the middleware
// https://github.com/vercel/next.js/issues/48295
export const runtime = 'nodejs';

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
    } else if (page.path !== getPagePath(params)) {
        redirect(pageHref(page, linksContext));
    }

    const document = await getPageDocument(content, page.id);

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
        title: { default: page.title, template: `%s | ${space.title}` },
        description: page.description,
        generator: 'GitBook',
        metadataBase: new URL(baseUrl()),
        icons: {
            icon: [
                {
                    url: customIcon?.light ?? absoluteHref('.gitbook/icon?size=small&theme=light'),
                    type: 'image/png',
                    media: '(prefers-color-scheme: light)',
                },
                {
                    url: customIcon?.dark ?? absoluteHref('.gitbook/icon?size=small&theme=dark'),
                    type: 'image/png',
                    media: '(prefers-color-scheme: dark)',
                },
            ],
        },
        openGraph: {
            images: [
                customization.socialPreview.url ?? absoluteHref('.gitbook/ogimage/' + page.id),
            ],
        },
        robots: space.visibility === 'public' ? 'index, follow' : 'noindex, nofollow',
    };
}
