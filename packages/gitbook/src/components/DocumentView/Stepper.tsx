import type { DocumentBlockStepper } from '@gitbook/api';

import type { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function Stepper(props: BlockProps<DocumentBlockStepper>) {
    const { block, style, ancestorBlocks, ...contextProps } = props;

    return (
        <Blocks
            blockStyle={style}
            {...contextProps}
            nodes={block.nodes}
            ancestorBlocks={[...ancestorBlocks, block]}
        />
    );
}
