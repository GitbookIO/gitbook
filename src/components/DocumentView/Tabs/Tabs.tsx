import { tcls } from '@/lib/tailwind';
import { BlockProps } from '../Block';
import { Blocks } from '../Blocks';
import { DynamicTabs } from './DynamicTabs';
import { DocumentBlockTabs } from '@gitbook/api';

export function Tabs(props: BlockProps<DocumentBlockTabs>) {
    const { block, style, context } = props;

    return (
        <DynamicTabs
            tabs={block.nodes.map((tab, index) => ({
                id: tab.key!,
                title: tab.data.title,
                children: <Blocks nodes={tab.nodes} context={context} />,
            }))}
            style={style}
        />
    );
}
