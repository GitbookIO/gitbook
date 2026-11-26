import type { JSONDocument, RevisionPageDocument } from '@gitbook/api';

import { DocumentView } from '../DocumentView';
import type { GitBookSiteContext } from '@/lib/context';
import { hasMoreThan } from '@/lib/document';

const LINK_PREVIEW_MAX_COUNT = 500;

export function PageBodyDocument(props: {
    context: GitBookSiteContext;
    page: RevisionPageDocument;
    document: JSONDocument;
}) {
    const { context, page, document } = props;
    const withLinkPreviews = !hasMoreThan(
        document,
        (inline) => inline.object === 'inline' && inline.type === 'link',
        LINK_PREVIEW_MAX_COUNT
    );

    return (
        <DocumentView
            document={document}
            style="flex flex-col [&>*+*]:mt-5"
            context={{
                mode: 'default',
                contentContext: { ...context, page },
                withLinkPreviews,
                withCommentAnchors: Boolean(context.changeRequest),
                isPageBody: true,
            }}
        />
    );
}
