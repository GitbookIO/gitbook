import { tcls } from '@/lib/tailwind';
import { BlockProps } from '../Block';
import { getNodeFragmentByType } from '@/lib/document';
import { Blocks } from '../Blocks';
import { DocumentBlockExpandable } from '@gitbook/api';
import { Inlines } from '../Inlines';

export function Expandable(props: BlockProps<DocumentBlockExpandable>) {
    const { block, style, context } = props;

    const title = getNodeFragmentByType(block, 'expandable-title');
    const body = getNodeFragmentByType(block, 'expandable-body');

    return (
        <details className={tcls(style, 'rounded', 'border', 'border-slate-300')}>
            <summary className={tcls('cursor-pointer', 'px-4', 'py-3')}>
                <Inlines nodes={title.nodes[0].nodes} context={context} />
            </summary>
            <Blocks nodes={body.nodes} context={context} style={['px-5', 'py-3']} />
        </details>
    );
}
