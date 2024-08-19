import { DocumentBlockExpandable, DocumentBlocksEssentials } from '@gitbook/api';
import { Icon } from '@gitbook/icons';

import { getNodeFragmentByType } from '@/lib/document';
import { tcls } from '@/lib/tailwind';

import { Details } from './Details';
import { BlockProps } from '../Block';
import { Blocks } from '../Blocks';
import { Inlines } from '../Inlines';

/**
 * Find nodes with ids within Expandable section's content.
 */
function getIdsInNodes(nodes: DocumentBlocksEssentials[]): string[] {
    const ids = []
    for (const node of nodes) {
        if ('meta' in node && typeof node.meta?.id === 'string') { ids.push(node.meta?.id); }
        if ('nodes' in node && node.nodes.length > 0) {
            ids.push(...getIdsInNodes(node.nodes as any[]))
        }
    }
    return ids.filter(Boolean);
}

export function Expandable(props: BlockProps<DocumentBlockExpandable>) {
    const { block, style, ancestorBlocks, document, context } = props;

    const title = getNodeFragmentByType(block, 'expandable-title');
    const body = getNodeFragmentByType(block, 'expandable-body');

    const titleParagraph = title?.nodes[0];

    if (!title || !body || titleParagraph?.type !== 'paragraph') {
        return null;
    }
    
    let id = block.meta?.id ?? '';
    id = context.getId ? context.getId(id) : id;
    
    return (
        <Details
            id={id}
            contentIds={getIdsInNodes(body.nodes)}
            open={context.mode === 'print'}
            className={style}
        >
            <summary
                className={tcls(
                    'cursor-pointer',
                    'px-4',
                    'pr-10',
                    'py-4',
                    'relative',
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
                <Icon
                    icon="chevron-right"
                    className={tcls(
                        'inline-block',
                        'size-3',
                        'mr-2',
                        'mb-1',
                        'transition-transform',
                        'shrink-0',
                        'group-open:rotate-90',
                    )}
                />
                <Inlines
                    nodes={titleParagraph.nodes}
                    document={document}
                    context={context}
                    ancestorInlines={[]}
                />
                <a
                    href={`#${id}`}
                    aria-label="Direct link to heading"
                    className={tcls(
                        'absolute',
                        'top-2',
                        'bottom-2',
                        'right-4',
                        'flex',
                        'items-center',
                        'dark:text-light/3',
                        'dark:shadow-none',
                        'dark:ring-0',
                    )}
                >
                    <Icon
                        icon="hashtag"
                        className={tcls(
                            'inline-block',
                            'size-3',
                            'transition-colors',
                            'text-transparent',
                            'group-hover:text-dark/6',
                            'dark:group-hover:text-light/5',
                        )}
                    />
                </a>
            </summary>
            <Blocks
                nodes={body.nodes}
                document={document}
                ancestorBlocks={[...ancestorBlocks, block]}
                context={context}
                style={['px-10', 'pb-5', 'space-y-4']}
            />
        </Details>
    );
}
