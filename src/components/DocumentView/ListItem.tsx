import {
    DocumentBlockListItem,
    DocumentBlockListOrdered,
    DocumentBlockListTasks,
    DocumentBlockListUnordered,
} from '@gitbook/api';

import { Checkbox } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';
import { Blocks } from './Blocks';
import { getBlockTextStyle } from './spacing';

export function ListItem(props: BlockProps<DocumentBlockListItem>) {
    const { block, ancestorBlocks, ...contextProps } = props;

    const textStyle = getBlockTextStyle(block);

    const parent = ancestorBlocks[ancestorBlocks.length - 1] as
        | DocumentBlockListOrdered
        | DocumentBlockListUnordered
        | DocumentBlockListTasks
        | undefined;

    const ListItemType = () => {
        switch (parent?.type) {
            case 'list-tasks':
                return (
                    <li>
                        <div className={tcls('flex', 'flex-row')}>
                            <div
                                className={tcls(
                                    textStyle.textSize,
                                    'flex',
                                    'flex-col',
                                    'justify-center',
                                    'h-[1lh]',
                                )}
                            >
                                <Checkbox
                                    id={block.key!}
                                    disabled
                                    checked={block.data?.checked}
                                    className={tcls('relative')}
                                />
                            </div>

                            <label htmlFor={block.key}>
                                <Blocks
                                    {...contextProps}
                                    nodes={block.nodes}
                                    ancestorBlocks={[...ancestorBlocks, block]}
                                    blockStyle={tcls('flex-1', 'flip-heading-hash')}
                                    style={tcls('ml-2', 'space-y-2')}
                                />
                            </label>
                        </div>
                    </li>
                );
            case 'list-ordered':
                const start = parent.data.start ?? 1;
                const indexInParent = parent.nodes.findIndex((node) => node.key === block.key) ?? 0;
                const index = indexInParent + start;

                return (
                    <li value={index} className={tcls(textStyle.lineHeight)}>
                        <div
                            data-value={index}
                            className={tcls(
                                'bullet',
                                textStyle.textSize,
                                'leading-[inherit]',
                                'before:content-[attr(data-value)]',
                            )}
                        ></div>
                        {/* zero width space to force layouts with empty lists */}
                        <Blocks
                            {...contextProps}
                            nodes={block.nodes}
                            ancestorBlocks={[...ancestorBlocks, block]}
                            style={tcls('space-y-2', 'flex', 'flex-col')}
                            blockStyle={tcls(
                                textStyle.lineHeight,
                                'min-h-[1lh]',
                                //flip heading hash icon if list item is a heading
                                'flip-heading-hash',
                            )}
                        />
                    </li>
                );
            default:
                // 'list-unordered'
                return (
                    <li className={tcls(textStyle.lineHeight)}>
                        <div className={tcls('bullet', textStyle.textSize)}></div>
                        <Blocks
                            {...contextProps}
                            nodes={block.nodes}
                            ancestorBlocks={[...ancestorBlocks, block]}
                            style={tcls('space-y-2', 'flex', 'flex-col')}
                            blockStyle={tcls(
                                'min-h-[1lh]',
                                //flip heading hash icon if list item is a heading
                                'flip-heading-hash',
                            )}
                        />
                    </li>
                );
        }
    };

    return <ListItemType />;
}
