import { DocumentBlockListItem } from '@gitbook/api';

import { Checkbox } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';
import { Blocks } from './Blocks';
import { getBlockTextStyle } from './spacing';

export function ListItem(props: BlockProps<DocumentBlockListItem>) {
    const { block, ancestorBlocks, ...contextProps } = props;

    const textStyle = getBlockTextStyle(block);

    const listType = ancestorBlocks[ancestorBlocks.length - 1]?.type;

    const ListItemType = () => {
        switch (listType) {
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
                                    blockStyle={tcls('flex-1')}
                                    style={tcls('ml-2', 'space-y-2')}
                                />
                            </label>
                        </div>
                    </li>
                );
            case 'list-ordered':
                return (
                    <li className={tcls(textStyle.lineHeight)}>
                        <div
                            className={tcls('bullet', textStyle.textSize, 'leading-[inherit]')}
                        ></div>
                        {/* zero width space to force layouts with empty lists */}
                        <Blocks
                            {...contextProps}
                            nodes={block.nodes}
                            ancestorBlocks={[...ancestorBlocks, block]}
                            style={tcls('space-y-2', 'flex', 'flex-col')}
                            blockStyle={tcls(textStyle.lineHeight, 'min-h-[1lh]')}
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
                            blockStyle={tcls('min-h-[1lh]')}
                        />
                    </li>
                );
        }
    };

    return <ListItemType />;
}
