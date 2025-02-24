import { DocumentBlockDrawing } from '@gitbook/api';

import { resolveContentRef } from '@/lib/references';

import { BlockProps } from './Block';
import { Caption } from './Caption';
import { imageBlockSizes } from './Images';
import { Image } from '../utils';

export async function Drawing(props: BlockProps<DocumentBlockDrawing>) {
    const { block, context } = props;

    const resolved =
        block.data.ref && context.contentContext
            ? await resolveContentRef(block.data.ref, context.contentContext)
            : null;
    if (!resolved) {
        return null;
    }

    return (
        <Caption {...props}>
            <Image
                sources={{
                    light: {
                        src: resolved.href,
                        size: resolved.file?.dimensions,
                    },
                }}
                resize={context.contentContext?.imageResizer}
                alt="Drawing"
                sizes={imageBlockSizes}
                zoom
            />
        </Caption>
    );
}
