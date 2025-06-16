import type { DocumentBlockDrawing } from '@gitbook/api';

import { Image } from '../utils';
import type { BlockProps } from './Block';
import { Caption } from './Caption';
import { imageBlockSizes } from './Images';

export async function Drawing(props: BlockProps<DocumentBlockDrawing>) {
    const { block, context } = props;
    if (!block.data.ref) {
        return null;
    }

    const resolved = await context.getContentRef(block.data.ref);

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
