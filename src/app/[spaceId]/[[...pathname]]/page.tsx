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

    const { space, customization, revision, page, ancestors } = await fetchPageData(params);
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
        />
    );
}

export async function generateMetadata({ params }: { params: PagePathParams }): Promise<Metadata> {
    const { space, page } = await fetchPageData(params);
    if (!page) {
        notFound();
    }

    return {
        title: { default: page.title, template: `%s | ${space.title}` },
        description: page.description,
        generator: 'GitBook',
        openGraph: {
            images: [absoluteHref('.gitbook/ogimage/' + page.id)],
        },
        robots: space.visibility === 'public' ? 'index, follow' : 'noindex, nofollow',

        // TODO with customization
        // themeColor
        // colorScheme
    };
}
