import { DocumentBlockContentRef } from '@gitbook/api';

import { Card, Emoji } from '@/components/primitives';
import { type ResolvedContentRef } from '@/lib/references';

import { BlockProps } from './Block';
import { Image } from '../utils';



export async function BlockContentRef(props: BlockProps<DocumentBlockContentRef>) {
    const { block, context, style } = props;

    const resolved = await context.resolveContentRef(block.data.ref, {
        resolveAnchorText: true,
    });

    if (!resolved) {
        return null;
    }

    return (
        <Card
            leadingIcon={resolved.icon ? <BlockContentRefIcon resolved={resolved}  /> : resolved.emoji ? <Emoji code={resolved.emoji} style="text-xl" /> : null}
            href={resolved.href}
            title={resolved.text}
            style={style}
        />
    );
}

function BlockContentRefIcon(props: { resolved: ResolvedContentRef }) {
    const { resolved,  } = props;
    return resolved.icon ? <Image 
        priority='lazy' 
        alt=""
        sources={{ light: { src: resolved.icon, size: { width: 24, height: 24 } }, dark: {src: resolved.icon }}}
        sizes={[ { width: 24 }]}
        className="size-6 flex-1 object-contain"
    /> : null;
}