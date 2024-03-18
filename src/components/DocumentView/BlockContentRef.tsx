import { DocumentBlockContentRef } from '@gitbook/api';

import { Card, Emoji } from '@/components/primitives';

import { BlockProps } from './Block';

export async function BlockContentRef(props: BlockProps<DocumentBlockContentRef>) {
    const { block, context, style } = props;
    const kind = block?.data?.ref?.kind;

    const resolved = await context.resolveContentRef(block.data.ref, {
        resolveAnchorText: true,
    });
    if (!resolved) {
        return null;
    }

    return (
        <Card
            leadingIcon={resolved.emoji ? <Emoji code={resolved.emoji} /> : null}
            href={resolved.href}
            preTitle={kind}
            title={resolved.text}
            style={style}
        />
    );
}
