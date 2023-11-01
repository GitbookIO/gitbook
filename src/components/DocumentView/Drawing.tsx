import { DocumentBlockDrawing } from '@gitbook/api';
import { BlockProps } from './Block';
import { tcls } from '@/lib/tailwind';

export function Drawing(props: BlockProps<DocumentBlockDrawing>) {
    const { style } = props;

    return <div className={tcls(style)}>TODO</div>;
}
