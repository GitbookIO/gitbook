import type { DocumentBlockTable, DocumentTableRecord } from '@gitbook/api';
import assertNever from 'assert-never';

import type { BlockProps } from '../Block';
import { isBlockOffscreen } from '../utils';
import { ViewCards } from './ViewCards';
import { ViewGrid } from './ViewGrid';

export type TableRecordKV = [string, DocumentTableRecord];

export interface TableViewProps<View> extends BlockProps<DocumentBlockTable> {
    view: View;
    records: TableRecordKV[];
    isOffscreen: boolean;
}

export function Table(props: BlockProps<DocumentBlockTable>) {
    const { block, ancestorBlocks, document } = props;
    const isOffscreen = isBlockOffscreen({ block, ancestorBlocks, document });

    const records: TableRecordKV[] = Object.entries(block.data.records).sort(
        ([aKey, aValue], [bKey, bValue]) => {
            const orderComparison = aValue.orderIndex.localeCompare(bValue.orderIndex);

            if (orderComparison !== 0) {
                return orderComparison;
            }

            return aKey.localeCompare(bKey);
        }
    );

    switch (block.data.view.type) {
        case 'cards':
            return (
                <ViewCards
                    view={block.data.view}
                    isOffscreen={isOffscreen}
                    records={records}
                    {...props}
                />
            );
        case 'grid':
            return (
                <ViewGrid
                    view={block.data.view}
                    isOffscreen={isOffscreen}
                    records={records}
                    {...props}
                />
            );
        default:
            assertNever(block.data.view);
    }
}
