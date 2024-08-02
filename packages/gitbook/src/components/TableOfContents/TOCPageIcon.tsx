import { RevisionPage } from '@gitbook/api';
import { PageIcon } from '../PageIcon';
import { tcls } from '@/lib/tailwind';

/**
 * Styled page icon for the table of contents.
 */
export function TOCPageIcon({ page }: { page: RevisionPage }) {
    return (
        <PageIcon
            page={page}
            style={tcls(
                'text-base',
                'text-dark/6',
                'dark:text-light/6',
                'group-aria-selected/toclink:text-primary',
                'group-aria-selected/toclink:dark:text-primary-400',
            )}
        />
    );
}
