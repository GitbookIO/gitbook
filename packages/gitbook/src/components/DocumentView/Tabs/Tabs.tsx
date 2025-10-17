import type { DocumentBlockTabs } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import type { BlockProps } from '../Block';
import { Blocks } from '../Blocks';
import { DynamicTabs, type TabsItem } from './DynamicTabs';

export function Tabs(props: BlockProps<DocumentBlockTabs>) {
    const { block, ancestorBlocks, document, style, context } = props;

    if (!block.key) {
        throw new Error('Tabs block is missing a key');
    }

    const id = block.key;

    const tabs: TabsItem[] = block.nodes.map((tab) => {
        if (!tab.key) {
            throw new Error('Tab block is missing a key');
        }

        return {
            id: tab.meta?.id ?? tab.key,
            title: tab.data.title ?? '',
            body: (
                <Blocks
                    key={tab.key}
                    nodes={tab.nodes}
                    document={document}
                    ancestorBlocks={[...ancestorBlocks, block, tab]}
                    context={context}
                    blockStyle="flip-heading-hash"
                    style="w-full space-y-4"
                />
            ),
        };
    });

    // When printing, we display the tab, one after the other
    if (context.mode === 'print') {
        return tabs.map((tab) => {
            return <DynamicTabs key={tab.id} id={id} tabs={[tab]} className={tcls(style)} />;
        });
    }

    return <DynamicTabs id={id} tabs={tabs} className={tcls(style)} />;
}
