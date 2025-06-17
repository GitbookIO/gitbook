import type { DocumentInlineIcon } from '@gitbook/api';

import { Icon, type IconName } from '@gitbook/icons';
import type { InlineProps } from './Inline';

export async function InlineIcon(props: InlineProps<DocumentInlineIcon>) {
    const { inline } = props;

    return <Icon icon={inline.data.icon as IconName} className="inline size-[1em]" />;
}
