import { type RevisionPage, RevisionPageType } from '@gitbook/api';
import type { GitBookSiteContext } from '@v2/lib/context';

import { type ClassValue, tcls } from '@/lib/tailwind';

import { PageDocumentItem } from './PageDocumentItem';
import { PageGroupItem } from './PageGroupItem';
import { PageLinkItem } from './PageLinkItem';

export function PagesList(props: {
    context: GitBookSiteContext;
    rootPages: RevisionPage[];
    pages: RevisionPage[];
    style?: ClassValue;
}) {
    const { rootPages, pages, context, style } = props;

    return (
        <ul className={tcls('flex', 'flex-col', 'gap-y-0.5', style)}>
            {pages.map((page) => {
                if (page.type === RevisionPageType.Computed) {
                    throw new Error(
                        'Unexpected computed page, it should have been computed in the API'
                    );
                }

                if (page.type === RevisionPageType.Link) {
                    return <PageLinkItem key={page.id} page={page} context={context} />;
                }

                if (page.hidden) {
                    return null;
                }

                if (page.type === RevisionPageType.Group) {
                    return (
                        <PageGroupItem
                            key={page.id}
                            rootPages={rootPages}
                            page={page}
                            context={context}
                        />
                    );
                }

                return (
                    <PageDocumentItem
                        key={page.id}
                        rootPages={rootPages}
                        page={page}
                        context={context}
                    />
                );
            })}
        </ul>
    );
}
