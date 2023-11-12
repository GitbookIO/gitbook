import { DocumentBlockDrawing } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';

export function Drawing(props: BlockProps<DocumentBlockDrawing>) {
    const { style } = props;

    return <div className={tcls(style)}>TODO</div>;
}
