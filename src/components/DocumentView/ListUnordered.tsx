import { DocumentBlockListUnordered } from '@gitbook/api';
import { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function ListUnordered(props: BlockProps<DocumentBlockListUnordered>) {
    const { block, style, ...contextProps } = props;

    return (
        <Blocks
            {...contextProps}
            tag="ul"
            nodes={block.nodes}
            style={['list-disc', 'ps-8', style]}
        />
    );
}
