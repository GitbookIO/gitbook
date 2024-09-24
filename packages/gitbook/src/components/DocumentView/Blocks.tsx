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

        /** HTML tag to use for the wrapper */
        tag?: Tag;

        /** Style passed to the wrapper */
        style?: ClassValue;

        /** Style passed to all blocks */
        blockStyle?: ClassValue;

        /** Props to pass to the wrapper element */
        wrapperProps?: React.ComponentProps<Tag>;
    },
) {
    const { nodes, tag: Tag = 'div', style, blockStyle, wrapperProps, ...contextProps } = props;

    return (
        <Tag {...wrapperProps} className={tcls(style)}>
            {nodes.map((node, index) => (
                <Block
                    key={node.key}
                    block={node}
                    style={[
                        node.data && 'fullWidth' in node.data && node.data.fullWidth
                            ? 'max-w-screen-xl'
                            : 'max-w-3xl',
                        'w-full',
                        'mx-auto',
                        'decoration-primary/6',
                        blockStyle,
                    ]}
                    {...contextProps}
                />
            ))}
        </Tag>
    );
}
