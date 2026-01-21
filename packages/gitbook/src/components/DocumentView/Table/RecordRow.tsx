import { type ClassValue, tcls } from '@/lib/tailwind';
import type { DocumentTableViewGrid } from '@gitbook/api';
import { RecordColumnValue } from './RecordColumnValue';
import type { TableRecordKV, TableViewProps } from './Table';
import { getColumnWidth } from './ViewGrid';
import styles from './table.module.css';
import { getColumnVerticalAlignment } from './utils';

export function RecordRow(
    props: TableViewProps<DocumentTableViewGrid> & {
        record: TableRecordKV;
        autoSizedColumns: string[];
        fixedColumns: string[];
        className?: ClassValue;
    }
) {
    const { view, autoSizedColumns, fixedColumns, block, context, className } = props;

    return (
        <div className={tcls(styles.row, className)} role="row">
            {view.columns.map((column) => {
                const columnWidth = getColumnWidth({
                    column,
                    columnWidths: context.mode === 'print' ? undefined : view.columnWidths,
                    autoSizedColumns,
                    fixedColumns,
                });
                // @ts-expect-error
                const verticalAlignment = getColumnVerticalAlignment(block.data.definition[column]);

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
