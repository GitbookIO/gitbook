import { RevisionPage, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';

import { ContentRefContext } from '@/lib/references';
import { ClassValue, tcls } from '@/lib/tailwind';

import { PageDocumentItem } from './PageDocumentItem';
import { PageGroupItem } from './PageGroupItem';
import { PageLinkItem } from './PageLinkItem';

export function PagesList(props: {
    rootPages: RevisionPage[];
    pages: RevisionPage[];
    activePage: RevisionPageDocument;
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
    context: ContentRefContext;
    style?: ClassValue;
}) {
    const { rootPages, pages, activePage, ancestors, context, style } = props;

    return (
        <ul className={tcls('flex', 'flex-1', 'flex-col', style)}>
            {pages.map((page) => {
                if (page.type === 'group') {
                    return (
                        <PageGroupItem
                            key={page.id}
                            rootPages={rootPages}
                            page={page}
                            activePage={activePage}
                            ancestors={ancestors}
                            context={context}
                        />
                    );
                } else if (page.type === 'link') {
                    return <PageLinkItem key={page.id} page={page} context={context} />;
                }

                return (
                    <PageDocumentItem
                        key={page.id}
                        rootPages={rootPages}
                        page={page}
                        activePage={activePage}
                        ancestors={ancestors}
                        context={context}
                    />
                );
            })}
        </ul>
    );
}
