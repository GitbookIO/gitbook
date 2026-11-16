import type { DocumentBlockDivider } from '@gitbook/api';

import type { BlockProps } from './Block';
import { cx } from '@/lib/classnames';

export function Divider(props: BlockProps<DocumentBlockDivider>) {
    const { style } = props;

    return <hr className={cx(style, 'border-tint-subtle')} />;
}
