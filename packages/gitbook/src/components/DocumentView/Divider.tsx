import { DocumentBlockDivider } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';

export function Divider(props: BlockProps<DocumentBlockDivider>) {
    const { style } = props;

    return <hr className={tcls(style, 'border-dark/2', 'dark:border-light/2')} />;
}
