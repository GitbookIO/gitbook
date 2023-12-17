import ChevronRight from '@geist-ui/icons/chevronRight';
import { DocumentBlockExpandable } from '@gitbook/api';

import { getNodeFragmentByType } from '@/lib/document';
import { tcls } from '@/lib/tailwind';

import { BlockProps } from '../Block';
import { Blocks } from '../Blocks';
import { Inlines } from '../Inlines';
export function Expandable(props: BlockProps<DocumentBlockExpandable>) {
    const { block, style, ancestorBlocks, document, context } = props;

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
                'shadow-dark/1',
                'bg-gradient-to-t',
                'from-white/8',
                'to-white/6',
                'ring-1',
                'ring-dark/1',
                'transition-color',

                'dark:ring-light/1',
                'dark:from-light/[0.03]',
                'dark:to-light/[0.01]',
                'dark:shadow-none',

                'group open:dark:to-light/[0.03]',
                'group open:to-white/9',
            )}
        >
            <summary
                className={tcls(
                    'cursor-pointer',
                    'px-4',
                    'py-3',
                    'list-none',
                    'select-none',
                    '[&::-webkit-details-marker]:hidden',
                )}
            >
                <ChevronRight
                    className={tcls(
                        'inline-block',
                        'w-4',
                        'h-4',
                        'mr-2',
                        'shrink-0',
                        'transition-all',
                        'group-open:rotate-90',
                    )}
                />
                <Inlines nodes={titleParagraph.nodes} document={document} context={context} />
            </summary>
            <Blocks
                nodes={body.nodes}
                document={document}
                ancestorBlocks={[...ancestorBlocks, block]}
                context={context}
                style={['px-5', 'py-3', 'space-y-3']}
            />
        </details>
    );
}
