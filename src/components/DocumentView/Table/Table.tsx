import { DocumentBlockTable, DocumentTableRecord } from '@gitbook/api';
import { BlockProps } from '../Block';
import { ViewCards } from './ViewCards';
import { ViewGrid } from './ViewGrid';
import assertNever from 'assert-never';

export type TableRecordKV = [string, DocumentTableRecord];

export interface TableViewProps<View> extends BlockProps<DocumentBlockTable> {
    view: View;
    records: TableRecordKV[];
}

export function Table(props: BlockProps<DocumentBlockTable>) {
    const { block } = props;

    const records: TableRecordKV[] = Object.entries(block.data.records).sort((a, b) => {
        return a[1].orderIndex.localeCompare(b[1].orderIndex);
    });

    switch (block.data.view.type) {
        case 'cards':
            return <ViewCards view={block.data.view} records={records} {...props} />;
        case 'grid':
            return <ViewGrid view={block.data.view} records={records} {...props} />;
        default:
            assertNever(block.data.view);
    }
}
