import { DocumentBlockExpandable } from '@gitbook/api';

import { getNodeFragmentByType } from '@/lib/document';
import { tcls } from '@/lib/tailwind';

import { BlockProps } from '../Block';
import { Blocks } from '../Blocks';
import { Inlines } from '../Inlines';

export function Expandable(props: BlockProps<DocumentBlockExpandable>) {
    const { block, style, ancestorBlocks, context } = props;

    const title = getNodeFragmentByType(block, 'expandable-title');
    const body = getNodeFragmentByType(block, 'expandable-body');

    const titleParagraph = title?.nodes[0];

    if (!title || !body || titleParagraph?.type !== 'paragraph') {
        return null;
    }

    return (
        <details
            className={tcls(
                style,
                'rounded',
                'shadow-1xs',
                'bg-gradient-to-t',
                'from-white/8',
                'to-white/6',
                'ring-1',
                'ring-dark/1',
                'dark:ring-light/1',
                'dark:from-light/[0.03]',
                'dark:to-light/[0.01]',
            )}
        >
            <summary className={tcls('cursor-pointer', 'px-4', 'py-3')}>
                <Inlines nodes={titleParagraph.nodes} context={context} />
            </summary>
            <Blocks
                nodes={body.nodes}
                ancestorBlocks={[...ancestorBlocks, block]}
                context={context}
                style={['px-5', 'py-3']}
            />
        </details>
    );
}
