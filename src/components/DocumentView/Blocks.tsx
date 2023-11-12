import { DocumentAnyBlock } from '@/lib/document';
import { tcls, ClassValue } from '@/lib/tailwind';

import { Block } from './Block';
import { DocumentContextProps } from './DocumentView';

export function Blocks<T extends DocumentAnyBlock, Tag extends React.ElementType = 'div'>(
    props: DocumentContextProps & {
        /** Blocks to render */
        nodes: T[];

        /** Ancestors of the blocks */
        ancestorBlocks: DocumentAnyBlock[];

        /** HTML tag to use */
        tag?: Tag;

        /** Style passed to the wrapper */
        style?: ClassValue;

        /** Style passed to all blocks */
        blockStyle?: ClassValue;

        /** Style passed to the first block */
        firstBlockStyle?: ClassValue;

        /** Style passed to the last block */
        lastBlockStyle?: ClassValue;
    },
) {
    const {
        nodes,
        tag: Tag = 'div',
        style,
        blockStyle = ['mt-6'],
        firstBlockStyle = ['mt-0'],
        lastBlockStyle,
        ...contextProps
    } = props;

    return (
        <Tag className={tcls(style)}>
            {nodes.map((node, index) => (
                <Block
                    key={node.key}
                    block={node}
                    style={[
                        'max-w-3xl', // Default max size for blocks, can be overridden in the block implementation
                        'mx-auto',
                        blockStyle,
                        index === 0 && firstBlockStyle,
                        index === nodes.length - 1 && lastBlockStyle,
                    ]}
                    {...contextProps}
                />
            ))}
        </Tag>
    );
}
