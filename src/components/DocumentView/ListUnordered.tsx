import { DocumentBlockListUnordered } from '@gitbook/api';

import { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function ListUnordered(props: BlockProps<DocumentBlockListUnordered>) {
    const { block, style, ancestorBlocks, ...contextProps } = props;

    const nestedBulletStyle = [
        // Level 1
        '[&>li>.bullet:before]:bullet-dash',
        // Level 2
        `[&_&>li>.bullet:before]:bullet-circleFilled`,
        // Level 3
        `[&_&_&>li>.bullet:before]:bullet-circle`,
        // Level 4
        `[&_&_&_&>li>.bullet:before]:bullet-squareFilled`,
        // Level 5
        `[&_&_&_&_&>li>.bullet:before]:bullet-square`,
    ];

    return (
        <Blocks
            {...contextProps}
            tag="ul"
            nodes={block.nodes}
            ancestorBlocks={[...ancestorBlocks, block]}
            style={[
                'list-none',
                'space-y-2',
                '[&>li]:relative',
                '[&>li]:ps-[2.25ch]',
                //remove any spacing when using heading as list item
                '[&>li>div_div]:mt-0',
                //custom content setup for lists
                '[&>li>.bullet]:before:bg-dark/6',
                '[&>li>.bullet]:before:absolute',
                '[&>li>.bullet]:before:left-0',
                '[&>li>.bullet]:before:w-[1ch]',
                '[&>li>.bullet]:before:h-[1lh]',
                '[&>li>.bullet]:before:[mask-repeat:no-repeat]',
                '[&>li>.bullet]:before:[mask-position:left]',
                'dark:[&>li>.bullet]:before:bg-light/6',
                nestedBulletStyle,
                style,
            ]}
        />
    );
}
