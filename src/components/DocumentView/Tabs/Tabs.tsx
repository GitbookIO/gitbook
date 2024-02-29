import { DocumentBlockTabs } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { DynamicTabs } from './DynamicTabs';
import { BlockProps } from '../Block';
import { Blocks } from '../Blocks';

export function Tabs(props: BlockProps<DocumentBlockTabs>) {
    const { block, ancestorBlocks, document, style, context } = props;

    const tabs = block.nodes.map((tab, index) => ({
        id: tab.key!,
        title: tab.data.title ?? '',
        children: (
            <Blocks
                nodes={tab.nodes}
                document={document}
                ancestorBlocks={[...ancestorBlocks, block, tab]}
                context={context}
                blockStyle={tcls('flip-heading-hash')}
                style={tcls('w-full', 'space-y-6')}
            />
        ),
    }));

    if (context.mode === 'print') {
        // When printing, we display the tab, one after the other
        return (
            <>
                {tabs.map((tab) => (
                    <DynamicTabs key={tab.id} tabs={[tab]} style={style} />
                ))}
            </>
        );
    }

    return <DynamicTabs tabs={tabs} style={style} />;
}
