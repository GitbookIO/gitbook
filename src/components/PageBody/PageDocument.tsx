import { api } from '@/lib/api';
import { Revision, RevisionPageDocument, Space } from '@gitbook/api';
import { DocumentView } from '../DocumentView';

/**
 * Fetch the document for the page and render it.
 */
export async function PageDocument(props: {
    space: Space;
    revision: Revision;
    page: RevisionPageDocument;
}) {
    const { space, revision, page } = props;

    const {
        data: { document },
    } = await api().spaces.getPageInRevisionById(space.id, revision.id, page.id);

    return <DocumentView document={document} />;
}
