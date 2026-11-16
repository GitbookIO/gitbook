import assertNever from 'assert-never';
import { assert } from 'ts-essentials';

import type {
    DocumentBlock,
    DocumentBlockListItem,
    DocumentBlockListOrdered,
    DocumentBlockListUnordered,
} from '@gitbook/api';

import type { BlockProps } from './Block';
import { Blocks } from './Blocks';
import { getBlockTextKind } from './spacing';
import { getCommentAnchorProps } from './utils';
import { Checkbox } from '@/components/primitives';
import { cx } from '@/lib/classnames';

export function ListItem(props: BlockProps<DocumentBlockListItem>) {
    const { block, ancestorBlocks, ...contextProps } = props;
    const { context } = contextProps;

    const parent = ancestorBlocks[ancestorBlocks.length - 1];
    assert(
        parent?.type === 'list-ordered' ||
            parent?.type === 'list-unordered' ||
            parent?.type === 'list-tasks',
        'Invalid parent list type'
    );

    const blocksElement = (
        <Blocks
            {...contextProps}
            nodes={block.nodes}
            ancestorBlocks={[...ancestorBlocks, block]}
            blockStyle="gb-list-child"
            style="gb-list-body"
        />
    );

    switch (parent.type) {
        case 'list-tasks':
            return (
                <ListItemLI block={block} anchorProps={getCommentAnchorProps(context, block.key)}>
                    <ListItemPrefix block={block}>
                        <Checkbox
                            id={block.key!}
                            disabled
                            checked={block.data?.checked}
                            className="relative"
                            size="small"
                        />
                    </ListItemPrefix>

                    <label htmlFor={block.key} className="flex-1">
                        {blocksElement}
                    </label>
                </ListItemLI>
            );
        case 'list-ordered':
            return (
                <ListItemLI block={block} anchorProps={getCommentAnchorProps(context, block.key)}>
                    <ListItemPrefix block={block}>
                        <PseudoBefore
                            content={getOrderedListItemPrefixContent({
                                depth: getListItemDepth({ ancestorBlocks, type: parent.type }),
                                block,
                                parent,
                            })}
                            style={{
                                fontSize: 'min(1em, 24px)',
                            }}
                        />
                    </ListItemPrefix>
                    {blocksElement}
                </ListItemLI>
            );
        case 'list-unordered':
            return (
                <ListItemLI block={block} anchorProps={getCommentAnchorProps(context, block.key)}>
                    <ListItemPrefix block={block}>
                        <PseudoBefore
                            content={getUnorderedListItemsPrefixContent({
                                depth: getListItemDepth({ ancestorBlocks, type: parent.type }),
                            })}
                            fontFamily="Arial"
                            style={{ fontSize: 'min(1.5em, 24px)', lineHeight: 1 }}
                        />
                    </ListItemPrefix>
                    {blocksElement}
                </ListItemLI>
            );
        default:
            assertNever(parent);
    }
}

function getListItemDepth(input: {
    ancestorBlocks: DocumentBlock[];
    type: DocumentBlockListOrdered['type'] | DocumentBlockListUnordered['type'];
}): number {
    const { ancestorBlocks, type } = input;

    let depth = -1;

    for (let i = ancestorBlocks.length - 1; i >= 0; i--) {
        const block = ancestorBlocks[i];
        if (block?.type === type) {
            depth = depth + 1;
            continue;
        }
        if (block?.type === 'list-item') {
            continue;
        }
        break;
    }

    return depth;
}

function ListItemLI(props: {
    block: DocumentBlockListItem;
    anchorProps: ReturnType<typeof getCommentAnchorProps>;
    children: React.ReactNode;
}) {
    const kind = getBlockTextKind(props.block);
    return (
        <li
            {...props.anchorProps}
            className={cx('gb-list-item', kind !== 'body' && `gb-list-item-${kind}`)}
        >
            {props.children}
        </li>
    );
}

// Sized after the item's first line through the `gb-list-item-*` modifier of its parent.
function ListItemPrefix(props: { block: DocumentBlockListItem; children: React.ReactNode }) {
    return <div className="gb-list-prefix">{props.children}</div>;
}

function getUnorderedListItemsPrefixContent(input: { depth: number }): string {
    switch (input.depth % 3) {
        case 0:
            return '•';
        case 1:
            return '◦';
        case 2:
            return '▪';
        default:
            return '•';
    }
}

function PseudoBefore(props: {
    style?: React.CSSProperties;
    content: string;
    fontFamily?: string;
}) {
    return (
        <div
            className="gb-list-marker"
            style={
                {
                    '--pseudoBefore--content': `'${props.content}'`,
                    '--font-family': props.fontFamily ?? 'inherit',
                    ...props.style,
                } as React.CSSProperties
            }
        />
    );
}

function getOrderedListItemPrefixContent(input: {
    depth: number;
    parent: DocumentBlockListOrdered;
    block: DocumentBlockListItem;
}): string {
    const { parent, block } = input;
    const start = parent.data.start ?? 1;

    let index: number;
    // If the block has a key, use it to find the index. Otherwise, use the object reference.
    if (block.key) {
        index = parent.nodes.findIndex((node) => node.key === block.key);
    } else {
        index = parent.nodes.findIndex((node) => node === block);
    }

    const value = index >= 0 ? index + start : Math.max(start, 1);
    switch (input.depth % 3) {
        // Use numbers
        case 0: {
            return `${value}.`;
        }
        // Use letters
        case 1: {
            const letters = 'abcdefghijklmnopqrstuvwxyz';
            return `${letters[(value - 1) % letters.length]}.`;
        }
        // Use roman numbers
        case 2: {
            return `${toRoman(value).toLowerCase()}.`;
        }
        default:
            return '•';
    }
}

function toRoman(input: number): string {
    const lookup = {
        M: 1000,
        CM: 900,
        D: 500,
        CD: 400,
        C: 100,
        XC: 90,
        L: 50,
        XL: 40,
        X: 10,
        IX: 9,
        V: 5,
        IV: 4,
        I: 1,
    };
    let roman = '';
    let number = input;
    for (const i in lookup) {
        while (number >= lookup[i as keyof typeof lookup]) {
            roman += i;
            number -= lookup[i as keyof typeof lookup];
        }
    }
    return roman;
}
