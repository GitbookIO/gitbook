import { getMergedCellWidth, getTableCellMerge } from './cellMerges';
import { getColumnWidth } from './layout';
import { RecordColumnValue } from './RecordColumnValue';
import type { TableGridViewProps, TableRecordKV } from './Table';
import { TableSearchRecord } from './TableSearch';
import { getColumnVerticalAlignment } from './utils';
import { tcls } from '@/lib/tailwind';

export function RecordRow(
    props: TableGridViewProps & {
        record: TableRecordKV;
        autoSizedColumns: string[];
        fixedColumns: string[];
    }
) {
    const { view, record, autoSizedColumns, fixedColumns, block, context, cellMergeLayout } = props;
    const stickyFirstColumn = context.mode !== 'print' && view.stickyFirstColumn === true;
    const firstVisibleColumn = view.columns[0];

    return (
        <TableSearchRecord
            role="row"
            recordId={record[0]}
            visibleClassName="flex"
            className={tcls(
                'group/row',
                'border-tint-subtle',
                'transition-colors',
                'hover:bg-tint-hover'
            )}
        >
            {view.columns.map((column) => {
                const cellMerge = getTableCellMerge(cellMergeLayout, record[0], column);
                if (cellMerge && !cellMerge.isAnchor) {
                    return null;
                }

                const renderedColumns = cellMerge?.merge.columns ?? [column];
                const columnWidth = getMergedCellWidth(
                    renderedColumns.map((mergedColumn) =>
                        getColumnWidth({
                            column: mergedColumn,
                            columnWidths: context.mode === 'print' ? undefined : view.columnWidths,
                            autoSizedColumns,
                            fixedColumns,
                        })
                    )
                );
                const isStickyFirstColumnCell = stickyFirstColumn && column === firstVisibleColumn;
                // @ts-expect-error
                const verticalAlignment = getColumnVerticalAlignment(block.data.definition[column]);

                return (
                    <div
                        key={column}
                        role="cell"
                        aria-colspan={cellMerge?.merge.colSpan}
                        className={tcls(
                            'relative flex flex-1 border-r px-3 py-2 align-middle text-sm last:border-r-0',
                            'border-tint-subtle',
                            isStickyFirstColumnCell
                                ? 'sticky left-0 z-10 bg-tint-base group-hover/row:bg-tint-hover'
                                : undefined
                        )}
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
        </TableSearchRecord>
    );
}
