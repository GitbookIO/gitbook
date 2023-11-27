import { JSONDocument, RevisionPageDocument, Space } from '@gitbook/api';

import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { PageFooterNavigation } from './PageFooterNavigation';
import { PageHeader } from './PageHeader';
import { DocumentView } from '../DocumentView';

export function PageBody(props: {
    space: Space;
    page: RevisionPageDocument;
    context: ContentRefContext;
    document: JSONDocument | null;
}) {
    const { space, context, page, document } = props;

    return (
        <main className={tcls('py-8', 'px-4', 'lg:px-12', 'flex-1')}>
            <PageHeader page={page} />
            {document ? (
                <DocumentView document={document} style={['space-y-6']} context={context} />
            ) : null}
            <PageFooterNavigation space={space} pages={context.pages} page={page} />
        </main>
    );
}
