import { tcls } from '@/lib/tailwind';
import { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function Hint(props: BlockProps<any>) {
    const { block, style, ...contextProps } = props;

    return (
        <div className={tcls('flex', 'flex-row', 'px-4', 'py-4', 'bg-slate-100', 'rounded', style)}>
            <div className={tcls('w-7')}>
                <div /> {/* TODO icon */}
            </div>
            <Blocks {...contextProps} nodes={block.nodes} style={['flex-1']} />
        </div>
    );
}
