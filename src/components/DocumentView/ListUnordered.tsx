import { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function ListUnordered(props: BlockProps<any>) {
    const { block, style } = props;

    return <Blocks tag="ul" nodes={block.nodes} style={['list-disc', 'ps-8', style]} />;
}
