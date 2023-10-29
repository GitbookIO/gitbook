import { BlockProps } from '../Block';
import { ViewCards } from './ViewCards';

export interface TableViewProps<View> extends BlockProps<any> {
    view: View;
    record: any[];
}

export function Table(props: BlockProps<any>) {
    const { block } = props;

    switch (block.data.view.type) {
        case 'cards':
            return <ViewCards view={block.data.view} {...props} />;
        default:
            return <div>Unsupported view {block.data.view.type}</div>;
    }
}
