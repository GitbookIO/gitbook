import type { DocumentInlineIcon, DocumentMarkColor } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import type { InlineProps } from './Inline';
import { textColorToStyle } from './utils/colors';

export async function InlineIcon(props: InlineProps<DocumentInlineIcon>) {
    const { inline } = props;
    const icon = inline.data.icon as IconName;
    const color = inline.data.color
        ? (inline.data.color as DocumentMarkColor['data']['text'])
        : undefined;

    return (
        <Icon
            icon={icon}
            className={tcls('inline size-[1em]', color ? textColorToStyle[color] : null)}
        />
    );
}
