import { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function Images(props: BlockProps<any>) {
    const { block, style, ...contextProps } = props;

    return (
        <Blocks
            {...contextProps}
            tag="div"
            nodes={block.nodes}
            style={[style, 'w-full', 'max-w-full', 'bg-slate-200', 'rounded', 'h-56']}
        />
    );
}
