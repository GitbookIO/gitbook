import {
    RevisionPage,
    RevisionPageDocument,
    RevisionPageGroup,
    RevisionPageType,
} from '@gitbook/api';

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
                if (page.type === RevisionPageType.Computed) {
                    throw new Error(
                        'Unexpected computed page, it should have been computed in the API',
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
