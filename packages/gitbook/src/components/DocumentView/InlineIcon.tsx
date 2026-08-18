import type { DocumentInlineIcon } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';

import type { InlineProps } from './Inline';
import { textColorToStyle } from '@/lib/colors';
import { tcls } from '@/lib/tailwind';

export async function InlineIcon(props: InlineProps<DocumentInlineIcon>) {
    const { inline } = props;
    const { color, icon } = inline.data;

    return (
        <Icon
            icon={icon as IconName}
            className={tcls('inline size-[1em]', color ? textColorToStyle[color] : null)}
        />
    );
}
