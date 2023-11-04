import { SpaceContent } from '@/components/SpaceContent';
import { PageHrefContext, absoluteHref, pageHref } from '@/lib/links';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { PagePathParams, fetchPageData, getPagePath } from '../fetch';
import { getPageDocument } from '@/lib/api';

/**
 * Fetch and render a page.
 */
export default async function Page(props: { params: PagePathParams }) {
    const { params } = props;

    const { space, customization, revision, page, collection, collectionSpaces, ancestors } =
        await fetchPageData(params);
    const linksContext: PageHrefContext = {};

    if (!page) {
        notFound();
    } else if (page.path !== getPagePath(params)) {
        redirect(pageHref(page, linksContext));
    }

    const document = await getPageDocument(space.id, revision.id, page.id);

    return (
        <SpaceContent
            space={space}
            customization={customization}
            revision={revision}
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
