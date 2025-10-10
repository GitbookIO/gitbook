import type { DocumentInlineIcon, DocumentMarkColor } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import type { InlineProps } from './Inline';
import { textColorToStyle } from './utils/colors';

export async function InlineIcon(props: InlineProps<DocumentInlineIcon>) {
    const { inline } = props;
    const icon = inline.data.icon as IconName;
    // @ts-expect-error remove this comment once API is updated
    const color = inline.data.color
        ? // @ts-expect-error remove "as DocumentMarkColor['data']['text']" once API is updated
          (inline.data.color as DocumentMarkColor['data']['text'])
        : undefined;

    return (
        <Icon
            icon={icon}
            className={tcls('inline size-[1em]', color ? textColorToStyle[color] : null)}
        />
    );
}
