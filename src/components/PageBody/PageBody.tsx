import { Revision, RevisionPageDocument, Space } from '@gitbook/api';
import { PageHeader } from './PageHeader';
import { PageDocument } from './PageDocument';
import { PageFooterNavigation } from './PageFooterNavigation';
import { tcls } from '@/lib/tailwind';

export function PageBody(props: { space: Space; revision: Revision; page: RevisionPageDocument }) {
    const { space, revision, page } = props;

    return (
        <main className={tcls('py-8', 'px-4', 'lg:px-12', 'flex-1')}>
            <PageHeader page={page} />
            <PageDocument space={space} revision={revision} page={page} />
            <PageFooterNavigation revision={revision} page={page} />
        </main>
    );
}
