import type {
    DocumentBlock,
    DocumentBlockListItem,
    DocumentBlockListOrdered,
    DocumentBlockListUnordered,
} from '@gitbook/api';
import assertNever from 'assert-never';
import { assert } from 'ts-essentials';

import { Checkbox } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';

import type { BlockProps } from './Block';
import { Blocks } from './Blocks';

const UNORDERED_STYLE = {
    '--font-family': 'inherit',
    fontSize: 'min(1em, 24px)',
};

export function ListItem(props: BlockProps<DocumentBlockListItem>) {
    const { block, ancestorBlocks, ...contextProps } = props;

    const parent = ancestorBlocks[ancestorBlocks.length - 1];
    assert(
        (parent && parent.type === 'list-ordered') ||
            parent.type === 'list-unordered' ||
            parent.type === 'list-tasks',
        'Invalid parent list type'
    );

    switch (parent.type) {
        case 'list-tasks':
            return (
                <li className={tcls('flex items-start')}>
                    <div
                        className={tcls(
                            'mr-1 flex min-h-[1lh] min-w-6 items-center justify-center text-tint'
                        )}
                    >
                        <Checkbox
                            id={block.key!}
                            disabled
                            checked={block.data?.checked}
                            className="relative"
                            size="small"
                        />
                    </div>

                    <label htmlFor={block.key} className={tcls('flex-1')}>
                        <Blocks
                            {...contextProps}
                            nodes={block.nodes}
                            ancestorBlocks={[...ancestorBlocks, block]}
                            blockStyle={tcls(
                                'min-h-[1lh]',
                                // flip heading hash icon if list item is a heading
                                'flip-heading-hash',
                                // remove margin-top for the first heading in a list
                                '[&:is(h2)>div]:mt-0',
                                '[&:is(h3)>div]:mt-0',
                                '[&:is(h4)>div]:mt-0',
                                // Override the "mx-auto" class from UnwrappedBlocks
                                'mx-0'
                            )}
                            style="flex min-w-0 flex-1 flex-col space-y-2"
                        />
                    </label>
                </li>
            );
        case 'list-ordered':
            return (
                <li className={tcls('flex items-start')}>
                    <div
                        className={tcls(
                            'mr-1 flex min-h-[1lh] min-w-6 items-center justify-center text-tint'
                        )}
                    >
                        <div
                            className="before:font-var before:content-[--pseudoBefore--content]"
                            style={
                                {
                                    '--pseudoBefore--content': `'${getOrderedListItemPrefixContent({
                                        depth: getListItemDepth({
                                            ancestorBlocks,
                                            type: parent.type,
                                        }),
                                        block,
                                        parent,
                                    })}'`,
                                    '--font-family': 'inherit',
                                    fontSize: 'min(1em, 24px)',
                                } as React.CSSProperties
                            }
                        />
                    </div>
                    <Blocks
                        {...contextProps}
                        nodes={block.nodes}
                        ancestorBlocks={[...ancestorBlocks, block]}
                        blockStyle={tcls(
                            'min-h-[1lh]',
                            // flip heading hash icon if list item is a heading
                            'flip-heading-hash',
                            // remove margin-top for the first heading in a list
                            '[&:is(h2)>div]:mt-0',
                            '[&:is(h3)>div]:mt-0',
                            '[&:is(h4)>div]:mt-0',
                            // Override the "mx-auto" class from UnwrappedBlocks
                            'mx-0'
                        )}
                        style="flex min-w-0 flex-1 flex-col space-y-2"
                    />
                </li>
            );
        case 'list-unordered':
            return (
                <li className={tcls('flex items-start')}>
                    <div
                        className={tcls(
                            'mr-1 flex min-h-[1lh] min-w-6 items-center justify-center text-tint'
                        )}
                    >
                        <div
                            className="before:font-var before:content-[--pseudoBefore--content]"
                            style={
                                {
                                    '--pseudoBefore--content': `'${getUnorderedListItemsPrefixContent(
                                        {
                                            depth: getListItemDepth({
                                                ancestorBlocks,
                                                type: parent.type,
                                            }),
                                        }
                                    )})}'`,
                                    ...UNORDERED_STYLE,
                                } as React.CSSProperties
                            }
                        />
                    </div>
                    <Blocks
                        {...contextProps}
                        nodes={block.nodes}
                        ancestorBlocks={[...ancestorBlocks, block]}
                        blockStyle={tcls(
                            'min-h-[1lh]',
                            // flip heading hash icon if list item is a heading
                            'flip-heading-hash',
                            // remove margin-top for the first heading in a list
                            '[&:is(h2)>div]:mt-0',
                            '[&:is(h3)>div]:mt-0',
                            '[&:is(h4)>div]:mt-0',
                            // Override the "mx-auto" class from UnwrappedBlocks
                            'mx-0'
                        )}
                        style="flex min-w-0 flex-1 flex-col space-y-2"
                    />
                </li>
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
        if (block.type === type) {
            depth = depth + 1;
            continue;
        }
        if (block.type === 'list-item') {
            continue;
        }
        break;
    }

    return depth;
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
            className="before:font-var before:content-[--pseudoBefore--content]"
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
    const index = parent.nodes.findIndex((node) => node.key === block.key) ?? 0;
    const value = index + start;
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
