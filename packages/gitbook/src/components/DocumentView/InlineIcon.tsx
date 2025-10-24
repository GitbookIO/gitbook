import type { DocumentInlineIcon } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import type { InlineProps } from './Inline';
import { textColorToStyle } from './utils/colors';

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
