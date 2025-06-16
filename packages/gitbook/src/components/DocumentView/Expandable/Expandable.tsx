import type { DocumentBlockExpandable } from '@gitbook/api';
import { Icon } from '@gitbook/icons';

import { getNodeFragmentByType } from '@/lib/document';
import { tcls } from '@/lib/tailwind';

import type { BlockProps } from '../Block';
import { Blocks } from '../Blocks';
import { Inlines } from '../Inlines';
import { Details } from './Details';

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
        <Details id={id} open={context.mode === 'print'} className={style}>
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
                    'text-tint',
                    'group-hover/expandable:text-tint-strong',
                    'group-open/expandable:text-tint-strong',
                    '[&::-webkit-details-marker]:hidden'
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
                        'group-open/expandable:rotate-90'
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
                        'dark:shadow-none',
                        'dark:ring-0'
                    )}
                >
                    <Icon
                        icon="hashtag"
                        className={tcls(
                            'inline-block',
                            'size-3',
                            'transition-colors',
                            'text-transparent',
                            'group-hover/expandable:text-tint-subtle',
                            'contrast-more:group-hover/expandable:text-tint-strong'
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
