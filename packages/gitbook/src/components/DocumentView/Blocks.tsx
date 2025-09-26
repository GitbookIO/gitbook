import type { DocumentBlock, JSONDocument } from '@gitbook/api';

import { type ClassValue, tcls } from '@/lib/tailwind';

import { Block } from './Block';
import type { DocumentContextProps } from './DocumentView';
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
    }
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

    /** True if all blocks should be considered offscreen */
    isOffscreen?: boolean;
};

/* Blocks that can be full width are automatically expanded on full-width pages.
 * Ideally we'd rely on the block type to determine if it can be full width, but
 * the block's `fullWidth` property does not differentiate between `undefined` and `false`.
 * So instead we hardcode a list of blocks that can be full width. */
const FULL_WIDTH_BLOCKS = [
    'table',
    'tabs',
    'integration',
    'openapi',
    'images',
    'embed',
    'columns',
    'code',
    'content-ref',
    'hint',
];

/**
 * Renders a list of blocks without a wrapper element.
 */
export function UnwrappedBlocks<TBlock extends DocumentBlock>(props: UnwrappedBlocksProps<TBlock>) {
    const { nodes, blockStyle, isOffscreen: defaultIsOffscreen = false, ...contextProps } = props;

    let isOffscreen = defaultIsOffscreen;
    return nodes.map((node, index) => {
        isOffscreen =
            isOffscreen ||
            isBlockOffscreen({
                document: props.document,
                block: node,
                ancestorBlocks: props.ancestorBlocks,
            });

        return (
            <Block
                key={node.key || `${node.type}-${index}`}
                block={node}
                style={[
                    'mx-auto page-width-wide:mx-0 w-full decoration-primary/6 print:break-inside-avoid',
                    node.data && 'fullWidth' in node.data && node.data.fullWidth
                        ? 'max-w-screen-xl'
                        : 'max-w-3xl',
                    FULL_WIDTH_BLOCKS.includes(node.type) && 'page-width-wide:max-w-full',
                    blockStyle,
                ]}
                isEstimatedOffscreen={isOffscreen}
                {...contextProps}
            />
        );
    });
}
