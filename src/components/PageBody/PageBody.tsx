import { Revision, RevisionPageDocument, Space } from '@gitbook/api';
import { PageHeader } from './PageHeader';
import { PageFooterNavigation } from './PageFooterNavigation';
import { tcls } from '@/lib/tailwind';
import { DocumentView } from '../DocumentView';

export function PageBody(props: {
    space: Space;
    revision: Revision;
    page: RevisionPageDocument;
    document: any;
}) {
    const { space, revision, page, document } = props;

    return (
        <main className={tcls('py-8', 'px-4', 'lg:px-12', 'flex-1')}>
            <PageHeader page={page} />
            <DocumentView
                document={document}
                style={'mt-6'}
                context={{
                    space,
                    revision,
                    page,
                }}
            />
            <PageFooterNavigation space={space} revision={revision} page={page} />
        </main>
    );
}
