import type { DocumentBlockDivider } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import type { BlockProps } from './Block';

export function Divider(props: BlockProps<DocumentBlockDivider>) {
    const { style } = props;

    return <hr className={tcls(style, 'page-width-wide:max-w-full border-tint-subtle')} />;
}
