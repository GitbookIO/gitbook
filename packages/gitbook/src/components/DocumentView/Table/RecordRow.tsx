import type { DocumentTableViewGrid } from '@gitbook/api';

import { RecordColumnValue } from './RecordColumnValue';
import type { TableRecordKV, TableViewProps } from './Table';
import { getColumnWidth } from './ViewGrid';
import { getColumnVerticalAlignment } from './utils';

export function RecordRow(
    props: TableViewProps<DocumentTableViewGrid> & {
        record: TableRecordKV;
        autoSizedColumns: string[];
        fixedColumns: string[];
    }
) {
    const { view, autoSizedColumns, fixedColumns, block, context } = props;

    return (
        <div className="row" role="row">
            {view.columns.map((column) => {
                const columnWidth = getColumnWidth({
                    column,
                    columnWidths: context.mode === 'print' ? undefined : view.columnWidths,
                    autoSizedColumns,
                    fixedColumns,
                });
                const verticalAlignment = getColumnVerticalAlignment(block.data.definition[column]);

                return (
                    <div
                        key={column}
                        role="cell"
                        className="cell"
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
