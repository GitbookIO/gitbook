import { Revision, RevisionPageDocument, Space } from '@gitbook/api';
import { PageHeader } from './PageHeader';
import { PageDocument } from './PageDocument';

export function PageBody(props: { space: Space; revision: Revision; page: RevisionPageDocument }) {
    const { space, revision, page } = props;

    return (
        <main>
            <PageHeader page={page} />
            <PageDocument space={space} revision={revision} page={page} />
        </main>
    );
}
