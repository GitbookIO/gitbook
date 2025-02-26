import type { RevisionPage } from '@gitbook/api';

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

                !page.emoji
                    ? [
                          'theme-gradient:bg-gradient-to-b',
                          'theme-bold:bg-gradient-to-b',
                          'theme-gradient:bg-fixed',
                          'theme-bold:bg-fixed',

                          'no-tint:from-primary-7',
                          'no-tint:to-primary-10',
                          'tint:from-tint-7',
                          'tint:to-tint-10',

                          'group-aria-current-page/toclink:bg-none',
                      ]
                    : '',

                'shrink-0'
            )}
        />
    );
}
