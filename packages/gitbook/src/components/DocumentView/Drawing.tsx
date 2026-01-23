import type { DocumentBlockDrawing } from '@gitbook/api';

import { resolveContentRefInDocument } from '@/lib/references';

import { Image } from '../utils';
import type { BlockProps } from './Block';
import { Caption } from './Caption';
import { imageBlockSizes } from './Images';

export async function Drawing(props: BlockProps<DocumentBlockDrawing>) {
    const { document, block, context } = props;

    const resolved =
        block.data.ref && context.contentContext
            ? await resolveContentRefInDocument(document, block.data.ref, context.contentContext)
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
                loading="lazy"
            />
        </Caption>
    );
}
