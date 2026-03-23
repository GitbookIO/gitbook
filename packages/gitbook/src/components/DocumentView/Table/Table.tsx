import type { DocumentBlockTable, DocumentTableRecord } from '@gitbook/api';
import assertNever from 'assert-never';

import { tcls } from '@/lib/tailwind';

import type { BlockProps } from '../Block';
import { isBlockOffscreen } from '../utils';
import { StickyViewGrid } from './StickyViewGrid';
import { ViewCards } from './ViewCards';
import { ViewGrid, ViewGridHeader } from './ViewGrid';
import { hasVisibleHeader } from './layout';
import styles from './table.module.css';

export type TableRecordKV = [string, DocumentTableRecord];

export interface TableViewProps<View> extends BlockProps<DocumentBlockTable> {
    view: View;
    records: TableRecordKV[];
    isOffscreen: boolean;
}

export function Table(props: BlockProps<DocumentBlockTable>) {
    const { block, ancestorBlocks, document, context, style } = props;
    const isOffscreen = isBlockOffscreen({ block, ancestorBlocks, document });

    const records: TableRecordKV[] = Object.entries(block.data.records).sort((a, b) => {
        return a[1].orderIndex.localeCompare(b[1].orderIndex);
    });

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
        case 'grid': {
            const gridProps = {
                ...props,
                view: block.data.view,
                isOffscreen,
                records,
            };
            const withHeader = hasVisibleHeader(block, block.data.view);
            const withStickyHeader =
                withHeader &&
                context.mode !== 'print' &&
                'stickyHeader' in block.data.view &&
                block.data.view.stickyHeader === true;

            if (withStickyHeader) {
                return (
                    <StickyViewGrid
                        className={tcls(style, styles.tableWrapper)}
                        header={
                            <div aria-hidden="true">
                                <ViewGridHeader
                                    {...gridProps}
                                    className={styles.stickyHeaderRowGroup}
                                />
                            </div>
                        }
                    >
                        <ViewGrid {...gridProps} headerClassName="sr-only" />
                    </StickyViewGrid>
                );
            }

            return (
                <div className={tcls(style, styles.tableWrapper)}>
                    <div className={styles.tableScrollArea}>
                        <ViewGrid {...gridProps} />
                    </div>
                </div>
            );
        }
        default:
            assertNever(block.data.view);
    }
}
