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
                'group/expandable',
                'shadow-dark/1',
                'bg-gradient-to-t',
                'from-light-1',
                'to-light-1',
                'border',
                'border-b-0',
                'border-light-3/9',
                //all
                '[&]:mt-[0px]',
                //select first child
                '[&:first-child]:mt-5',
                '[&:first-child]:rounded-t-lg',
                //select first in group
                '[:not(&)_+&]:mt-5',
                '[:not(&)_+&]:rounded-t-lg',
                //select last in group
                '[&:not(:has(+_&))]:mb-5',
                '[&:not(:has(+_&))]:rounded-b-lg',
                '[&:not(:has(+_&))]:border-b',
                /* '[&:not(:has(+_&))]:shadow-1xs', */

                'dark:border-dark-3/10',
                'dark:from-dark-2',
                'dark:to-dark-2',
                'dark:shadow-none',

                'group open:dark:to-dark-2/8',
                'group open:to-light-1/6',
            )}
        >
            <summary
                className={tcls(
                    'cursor-pointer',
                    'px-4',
                    'py-4',
                    'list-none',
                    'select-none',
                    'transition-colors',
                    'group-hover/expandable:text-dark-4/7',
                    'group-open:text-dark-3/7',
                    'dark:group-open:text-light-3/7',
                    'dark:group-hover/expandable:text-light-3/7',
                    '[&::-webkit-details-marker]:hidden',
                )}
            >
                <ChevronRight
                    className={tcls(
                        'inline-block',
                        'w-4',
                        'h-4',
                        'mr-2',
                        'mb-1',
                        'transition-transform',
                        'shrink-0',
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
                style={['px-10', 'pb-5', 'space-y-3']}
            />
        </details>
    );
}
