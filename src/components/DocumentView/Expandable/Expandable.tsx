import { tcls } from '@/lib/tailwind';
import { BlockProps } from '../Block';
import { getNodeFragmentByType } from '@/lib/document';
import { Blocks } from '../Blocks';
import { DocumentBlockExpandable } from '@gitbook/api';

export function Expandable(props: BlockProps<DocumentBlockExpandable>) {
    const { block, style, context } = props;

    const title = getNodeFragmentByType(block, 'expandable-title');
    const body = getNodeFragmentByType(block, 'expandable-title');

    return (
        <details className={tcls(style)}>
            <Blocks tag="summary" nodes={title.nodes} context={context} />
            <Blocks nodes={body.nodes} context={context} />
        </details>
    );
}
