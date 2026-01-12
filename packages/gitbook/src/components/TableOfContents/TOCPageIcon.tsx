import type { RevisionPage } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { PageIcon } from '../PageIcon';

/**
 * Styled page icon for the table of contents.
 */
export function TOCPageIcon({ page }: { page: Pick<RevisionPage, 'emoji' | 'icon'> }) {
    return (
        <PageIcon
            page={page}
            style={tcls(
                'text-base',
                'in-[.toclink]:text-tint-strong/6',
                'group-aria-current-page/toclink:text-primary-subtle',
                'contrast-more:group-aria-current-page/toclink:text-primary',

                !page.emoji
                    ? [
                          'theme-bold-no-tint:text-primary-subtle',
                          'theme-gradient-no-tint:text-primary-subtle',
                          'theme-bold-tint:text-tint-subtle',
                          'theme-gradient-tint:text-tint-subtle',

                          'group-aria-current-page/toclink:text-inherit!',
                      ]
                    : '',

                'shrink-0'
            )}
        />
    );
}
