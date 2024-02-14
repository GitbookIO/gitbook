import { DocumentBlockDrawing } from '@gitbook/api';

import { BlockProps } from './Block';
import { Caption } from './Caption';
import { imageBlockSizes } from './Images';
import { Image } from '../utils';

export async function Drawing(props: BlockProps<DocumentBlockDrawing>) {
    const { block, context } = props;

    const resolved = block.data.ref ? await context.resolveContentRef(block.data.ref) : null;
    if (!resolved) {
        return null;
    }

    return (
        <Caption {...props}>
            <Image
                sources={{
                    light: {
                        src: resolved.href,
                        size: resolved.fileDimensions,
                    },
                }}
                alt="Drawing"
                sizes={imageBlockSizes}
            />
        </Caption>
    );
}
