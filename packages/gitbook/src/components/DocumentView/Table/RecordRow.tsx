import { DocumentTableViewGrid } from '@gitbook/api';
import React from 'react';

import { tcls } from '@/lib/tailwind';

import { RecordColumnValue } from './RecordColumnValue';
import { TableRecordKV, TableViewProps } from './Table';
import styles from './table.module.css';
import { getColumnVerticalAlignment } from './utils';
import { getColumnWidth } from './ViewGrid';

export function RecordRow(
    props: TableViewProps<DocumentTableViewGrid> & {
        record: TableRecordKV;
        autoSizedColumns: string[];
        fixedColumns: string[];
    },
) {
    const { view, autoSizedColumns, fixedColumns, block } = props;

    return (
        <div className={styles.row} role="row">
            {view.columns.map((column) => {
                const columnWidth = getColumnWidth({
                    column,
                    columnWidths: view.columnWidths,
                    autoSizedColumns,
                    fixedColumns,
                });
                const verticalAlignment = getColumnVerticalAlignment(
                    block.data.definition[column],
                    view,
                );

                return (
                    <div
                        key={column}
                        role="cell"
                        className={tcls(styles.cell)}
                        style={{
                            width: columnWidth,
                            minWidth: columnWidth || '100px',
                        }}
                    >
                        <RecordColumnValue
                            {...props}
                            column={column}
                            verticalAlignment={verticalAlignment}
                        />
                    </div>
                );
            })}
        </div>
    );
}
