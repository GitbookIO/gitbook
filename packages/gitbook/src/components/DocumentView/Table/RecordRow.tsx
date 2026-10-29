import { getCommentCellProps } from '../utils';
import { getMergedCellWidth, getTableCellMerge } from './cellMerges';
import './columnWidths.css';
import { MAX_COLUMN_WIDTH_VARS, getColumnWidth } from './layout';
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
            {view.columns.map((column, columnIndex) => {
                const cellMerge = getTableCellMerge(cellMergeLayout, record[0], column);
                if (cellMerge && !cellMerge.isAnchor) {
                    return null;
                }

                const renderedColumns = cellMerge?.merge.columns ?? [column];
                // A plain cell takes its width from the column variable the grid sets; only merged
                // cells and columns past the generated classes need a width of their own.
                const widthFromColumnVar =
                    renderedColumns.length === 1 && columnIndex < MAX_COLUMN_WIDTH_VARS;
                const columnWidth = widthFromColumnVar
                    ? undefined
                    : getMergedCellWidth(
                          renderedColumns.map((mergedColumn) =>
                              getColumnWidth({
                                  column: mergedColumn,
                                  columnWidths:
                                      context.mode === 'print' ? undefined : view.columnWidths,
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
                            widthFromColumnVar ? `gb-tcol-${columnIndex}` : undefined,
                            isStickyFirstColumnCell ? 'table-grid-cell-sticky' : undefined
                        )}
                        style={
                            widthFromColumnVar
                                ? undefined
                                : { width: columnWidth, minWidth: columnWidth || '100px' }
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
