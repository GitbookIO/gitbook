import type { DocumentInlineIcon } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';

import type { InlineProps } from './Inline';
import { cx } from '@/lib/classnames';
import { textColorToStyle } from '@/lib/colors';

export async function InlineIcon(props: InlineProps<DocumentInlineIcon>) {
    const { inline } = props;
    const { color, icon } = inline.data;

    return (
        <Icon
            icon={icon as IconName}
            className={cx('inline-icon', color ? textColorToStyle[color] : null)}
        />
    );
}
