import { DocumentBlock, JSONDocument } from '@gitbook/api';

import { tcls, ClassValue } from '@/lib/tailwind';

import { Block } from './Block';
import { DocumentContextProps } from './DocumentView';
import { isBlockOffscreen } from './utils';

/**
 * Renders a list of blocks with a wrapper element.
 */
export function Blocks<TBlock extends DocumentBlock, Tag extends React.ElementType = 'div'>(
    props: UnwrappedBlocksProps<TBlock> & {
        /** HTML tag to use for the wrapper */
        tag?: Tag;

        /** Style passed to the wrapper */
        style?: ClassValue;

        /** Props to pass to the wrapper element */
        wrapperProps?: React.ComponentProps<Tag>;
    },
) {
    const { tag: Tag = 'div', style, wrapperProps, ...blocksProps } = props;

    return (
        <Tag {...wrapperProps} className={tcls(style)}>
            <UnwrappedBlocks {...blocksProps} />
        </Tag>
    );
}

type UnwrappedBlocksProps<TBlock extends DocumentBlock> = DocumentContextProps & {
    /** Blocks to render */
    nodes: TBlock[];

    /** Document being rendered */
    document: JSONDocument;

    /** Ancestors of the blocks */
    ancestorBlocks: DocumentBlock[];

    /** Style passed to all blocks */
    blockStyle?: ClassValue;
};

/**
 * Renders a list of blocks without a wrapper element.
 */
export function UnwrappedBlocks<TBlock extends DocumentBlock>(props: UnwrappedBlocksProps<TBlock>) {
    const { nodes, blockStyle, ...contextProps } = props;

    let isOffscreen = false;

    return (
        <>
            {nodes.map((node) => {
                isOffscreen = isOffscreen || isBlockOffscreen({ document: props.document, block: node, ancestorBlocks: props.ancestorBlocks });
                
                return <Block
                    key={node.key}
                    block={node}
                    style={[
                        'w-full mx-auto decoration-primary/6',
                        node.data && 'fullWidth' in node.data && node.data.fullWidth
                            ? 'max-w-screen-xl'
                            : 'max-w-3xl',
                        blockStyle,
                    ]}
                    isEstimatedOffscreen={isOffscreen}
                    {...contextProps}
                />
            })}
        </>
    );
}
