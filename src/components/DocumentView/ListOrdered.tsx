import { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function ListOrdered(props: BlockProps<any>) {
    const { block, style } = props;

    return <Blocks tag="ol" nodes={block.nodes} style={['list-decimal', 'ps-8', style]} />;
}
