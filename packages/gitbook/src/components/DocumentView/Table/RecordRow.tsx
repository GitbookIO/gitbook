import { getCommentCellProps } from '../utils';
import { getMergedCellWidth, getTableCellMerge } from './cellMerges';
import { getColumnWidth } from './layout';
import { RecordColumnValue } from './RecordColumnValue';
import type { TableGridViewProps, TableRecordKV } from './Table';
import { TableSearchRecord } from './TableSearch';
import './styles.css';
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
            className={tcls('group/row', 'table-grid-row')}
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
                        {...getCommentCellProps(context, record[0], column)}
                        aria-colspan={cellMerge?.merge.colSpan}
                        className={tcls(
                            'table-grid-cell',
                            isStickyFirstColumnCell ? 'table-grid-cell-sticky' : undefined
                        )}
                        // The cell's width and min-width both come from this, so it is carried once
                        // rather than spelled out twice in every cell's style attribute.
                        style={
                            {
                                '--table-column-width': columnWidth || '100px',
                            } as React.CSSProperties
                        }
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
