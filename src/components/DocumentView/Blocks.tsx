import clsx from 'clsx';
import { ClassValue } from 'clsx';
import { Block } from './Block';

export function Blocks<T>(props: {
    /** Blocks to render */
    nodes: T[];

    /** HTML tag to use */
    tag?: string;

    /** Style passed to the wrapper */
    style?: ClassValue;

    /** Style passed to all blocks */
    blockStyle?: ClassValue;

    /** Style passed to the first block */
    firstBlockStyle?: ClassValue;

    /** Style passed to the last block */
    lastBlockStyle?: ClassValue;
}) {
    const { nodes, tag: Tag = 'div', style, blockStyle, firstBlockStyle, lastBlockStyle } = props;

    return (
        <Tag className={clsx(style)}>
            {nodes.map((node, index) => (
                <Block
                    key={node.key}
                    block={node}
                    style={clsx(
                        blockStyle,
                        index === 0 && firstBlockStyle,
                        index === nodes.length - 1 && lastBlockStyle,
                    )}
                />
            ))}
        </Tag>
    );
}
