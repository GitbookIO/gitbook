import { DocumentBlockTabs } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { DynamicTabs } from './DynamicTabs';
import { BlockProps } from '../Block';
import { Blocks } from '../Blocks';

export function Tabs(props: BlockProps<DocumentBlockTabs>) {
    const { block, ancestorBlocks, style, context } = props;

    return (
        <DynamicTabs
            tabs={block.nodes.map((tab, index) => ({
                id: tab.key!,
                title: tab.data.title ?? '',
                children: (
                    <Blocks
                        nodes={tab.nodes}
                        ancestorBlocks={[...ancestorBlocks, block, tab]}
                        context={context}
                    />
                ),
            }))}
            style={style}
        />
    );
}
