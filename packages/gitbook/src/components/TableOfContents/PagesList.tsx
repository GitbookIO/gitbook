import { RevisionPage, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';

import { ContentRefContext } from '@/lib/references';
import { ClassValue, tcls } from '@/lib/tailwind';

import { PageDocumentItem } from './PageDocumentItem';
import { PageGroupItem } from './PageGroupItem';
import { PageLinkItem } from './PageLinkItem';

export function PagesList(props: {
    rootPages: RevisionPage[];
    pages: RevisionPage[];
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
    context: ContentRefContext;
    style?: ClassValue;
}) {
    const { rootPages, pages, ancestors, context, style } = props;

    return (
        <ul className={tcls('flex', 'flex-1', 'flex-col', 'gap-y-0.5', style)}>
            {pages.map((page) => {
                if (page.type === 'link') {
                    return <PageLinkItem key={page.id} page={page} context={context} />;
                }

                if (page.hidden) {
                    return null;
                }

                if (page.type === 'group') {
                    return (
                        <PageGroupItem
                            key={page.id}
                            rootPages={rootPages}
                            page={page}
                            ancestors={ancestors}
                            context={context}
                        />
                    );
                }

                return (
                    <PageDocumentItem
                        key={page.id}
                        rootPages={rootPages}
                        page={page}
                        ancestors={ancestors}
                        context={context}
                    />
                );
            })}
        </ul>
    );
}
