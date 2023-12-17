import { DocumentBlock, JSONDocument } from '@gitbook/api';

import { tcls, ClassValue } from '@/lib/tailwind';

import { Block } from './Block';
import { DocumentContextProps } from './DocumentView';

export function Blocks<T extends DocumentBlock, Tag extends React.ElementType = 'div'>(
    props: DocumentContextProps & {
        /** Blocks to render */
        nodes: T[];

        /** Document being rendered */
        document: JSONDocument;

        /** Ancestors of the blocks */
        ancestorBlocks: DocumentBlock[];

        /** HTML tag to use */
        tag?: Tag;

        /** Style passed to the wrapper */
        style?: ClassValue;

        /** Style passed to all blocks */
        blockStyle?: ClassValue;
    },
) {
    const { nodes, tag: Tag = 'div', style, blockStyle, ...contextProps } = props;

    return (
        <Tag className={tcls(style)}>
            {nodes.map((node, index) => (
                <Block
                    key={node.key}
                    block={node}
                    style={['max-w-3xl', 'w-full', 'mx-auto', 'decoration-primary/6', blockStyle]}
                    {...contextProps}
                />
            ))}
        </Tag>
    );
}
