import { DocumentBlockDivider } from '@gitbook/api';
import { BlockProps } from './Block';
import { tcls } from '@/lib/tailwind';

export function Divider(props: BlockProps<DocumentBlockDivider>) {
    const { style } = props;

    return <hr className={tcls(style)} />;
}
