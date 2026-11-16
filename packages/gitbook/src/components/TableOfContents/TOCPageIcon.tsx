import type { RevisionPage } from '@gitbook/api';

import { PageIcon } from '../PageIcon';

/**
 * Styled page icon for the table of contents.
 */
export function TOCPageIcon({ page }: { page: Pick<RevisionPage, 'emoji' | 'icon'> }) {
    return <PageIcon page={page} style="toc-icon" />;
}
