import { tcls } from '@/lib/tailwind';
import { BlockProps } from '../Block';
import { Blocks } from '../Blocks';
import { DynamicTabs } from './DynamicTabs';

export function Tabs(props: BlockProps<any>) {
    const { block, style, context } = props;

    return (
        <DynamicTabs
            tabs={block.nodes.map((tab, index) => ({
                id: tab.key ?? index, // TODO: fix in API
                title: tab.data.title,
                children: <Blocks nodes={tab.nodes} context={context} />,
            }))}
            style={style}
        />
    );
}
