import { Revision, RevisionPage, RevisionPageDocument, Space } from '@gitbook/api';

import { TableOfContents } from '@/components/TableOfContents';
import clsx from 'clsx';
import { Header } from '@/components/Header';
import { PageBody } from '@/components/PageBody';
import { notFound, redirect } from 'next/navigation';
import { pageHref } from '@/lib/links';

/**
 * Render the entire content of the space (header, table of contents, footer, and page content).
 */
export function SpaceContent(props: { space: Space; revision: Revision; pagePath: string }) {
    const { space, revision, pagePath } = props;
    const activePage = resolvePagePath(revision, pagePath);

    return (
        <div>
            <Header space={space} />
            <div className={clsx('max-w-8xl mx-auto px-4 sm:px-6 md:px-8')}>
                <TableOfContents revision={revision} activePage={activePage} />
                <div className={clsx('lg:pl-[19.5rem]')}>
                    <div className={clsx('max-w-3xl', 'py-8', 'px-4')}>
                        <PageBody space={space} revision={revision} page={activePage} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function resolvePagePath(revision: Revision, pagePath: string): RevisionPageDocument {
    const resolveFirstDocument = (pages: RevisionPage[]): RevisionPageDocument | undefined => {
        for (const page of pages) {
            if (page.type === 'link') {
                continue;
            }

            return resolvePage(page);
        }

        return;
    };

    const resolvePage = (page: RevisionPage): RevisionPageDocument => {
        if (page.type === 'group') {
            const firstDocument = resolveFirstDocument(page.pages);
            if (firstDocument) {
                redirect(pageHref(firstDocument.path));
            }

            notFound();
        } else if (page.type === 'link') {
            notFound();
        }

        return page;
    };

    const iteratePages = (pages: RevisionPage[]): RevisionPageDocument | undefined => {
        for (const page of pages) {
            if (page.type === 'link') {
                continue;
            }

            if (page.path !== pagePath) {
                // TODO: can be optimized to count the number of slashes and skip the entire subtree
                const result = iteratePages(page.pages);
                if (result) {
                    return result;
                }

                continue;
            }

            return resolvePage(page);
        }
    };

    if (!pagePath) {
        const firstPage = resolveFirstDocument(revision.pages);
        if (!firstPage) {
            notFound();
        }

        return firstPage;
    }

    const result = iteratePages(revision.pages);
    if (!result) {
        notFound();
    }

    return result;
}
