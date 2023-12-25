import { DocumentBlockContentRef } from '@gitbook/api';

import { BlockProps } from './Block';
import { Card } from '../primitives';

export async function BlockContentRef(props: BlockProps<DocumentBlockContentRef>) {
    const { block, context, style } = props;
    const kind = block?.data?.ref?.kind;

    const resolved = await context.resolveContentRef(block.data.ref);
    if (!resolved) {
        return null;
    }

    return <Card href={resolved.href} preTitle={kind} title={resolved.text} style={style} />;
}
