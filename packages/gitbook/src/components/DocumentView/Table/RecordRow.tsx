import { DocumentTableViewGrid } from '@gitbook/api';
import React from 'react';

import { RecordColumnValue } from './RecordColumnValue';
import { TableRecordKV, TableViewProps } from './Table';
import styles from './table.module.css';
import { getColumnWidth } from './ViewGrid';

export function RecordRow(
    props: TableViewProps<DocumentTableViewGrid> & {
        record: TableRecordKV;
        autoSizedColumns: string[];
        fixedColumns: string[];
    },
) {
    const { view, autoSizedColumns, fixedColumns } = props;

    return (
        <div className={styles.row} role="row">
            {view.columns.map((column) => {
                const columnWidth = getColumnWidth({
                    column,
                    columnWidths: view.columnWidths,
                    autoSizedColumns,
                    fixedColumns,
                });
                return (
                    <div
                        key={column}
                        role="cell"
                        className={styles.cell}
                        style={{
                            width: columnWidth,
                            minWidth: columnWidth || '100px',
                        }}
                    >
                        <RecordColumnValue {...props} column={column} />
                    </div>
                );
            })}
        </div>
    );
}
