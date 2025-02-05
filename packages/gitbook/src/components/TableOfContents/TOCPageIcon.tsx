import { RevisionPage } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { PageIcon } from '../PageIcon';

/**
 * Styled page icon for the table of contents.
 */
export function TOCPageIcon({ page }: { page: RevisionPage }) {
    return (
        <PageIcon
            page={page}
            style={tcls(
                'text-base',
                'text-tint-strong/6',
                'group-aria-current-page/toclink:text-primary-subtle',
                'contrast-more:group-aria-current-page/toclink:text-primary',
                'shrink-0',
            )}
        />
    );
}
