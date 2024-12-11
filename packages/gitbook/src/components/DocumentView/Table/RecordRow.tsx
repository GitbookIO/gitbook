import { DocumentTableViewGrid } from '@gitbook/api';
import React from 'react';

import { tcls } from '@/lib/tailwind';

import { RecordColumnValue } from './RecordColumnValue';
import { TableRecordKV, TableViewProps } from './Table';
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
        <div
            className={tcls('flex', 'border-dark/3', 'dark:border-light/2', '[&>*+*]:border-l')}
            role="row"
        >
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
                        className={tcls(
                            'flex-1',
                            'align-middle',
                            'border-dark/2',
                            'py-2',
                            'px-3',
                            'text-sm',
                            'lg:text-base',
                            'dark:border-light/2',
                        )}
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
