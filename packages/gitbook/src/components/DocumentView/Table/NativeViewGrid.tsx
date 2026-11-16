import { getCommentCellProps } from '../utils';
import { getTableCellMerge } from './cellMerges';
import { getColumnWidth, getViewGridLayout, hasVisibleHeader } from './layout';
import { RecordColumnValue } from './RecordColumnValue';
import { StickyViewGrid } from './StickyViewGrid';
import type { TableGridViewProps } from './Table';
import { TableHoverTable } from './TableHoverTable';
import { TableSearchTableBody } from './TableSearch';
import { getColumnAlignment, getColumnVerticalAlignment, type VerticalAlignment } from './utils';
import { cx } from '@/lib/classnames';
import { tcls } from '@/lib/tailwind';

/** Semantic table renderer used when a cell spans multiple records. */
export function NativeViewGrid(props: TableGridViewProps) {
    const { block, view, context, style } = props;
    const { tableWidth } = getViewGridLayout({
        block,
        view,
        mode: context.mode,
    });
    const tableContainerClassName = tableWidth === 'w-full' ? 'min-w-full w-fit' : tableWidth;
    const withHeader = hasVisibleHeader(block, view);
    const withStickyHeader = withHeader && context.mode !== 'print' && view.stickyHeader === true;
    const withStickyFirstColumn = context.mode !== 'print' && view.stickyFirstColumn === true;
    const header = withHeader ? (
        <NativeViewGridHeader
            {...props}
            stickyHeader={withStickyHeader}
            stickyFirstColumn={withStickyFirstColumn}
            className={cx(
                withStickyHeader
                    ? [
                          'mb-0 border-t border-r border-l',
                          'group-data-[scrollable=false]/table:mb-1',
                          'group-data-[scrollable=false]/table:rounded-b-lg',
                          'group-data-[scrollable=true]/table:border-t-0',
                          'group-data-[scrollable=true]/table:border-x-0',
                      ]
                    : undefined
            )}
        />
    ) : undefined;
    const body = (
        <NativeViewGridBody
            {...props}
            withHeader={withHeader}
            stickyFirstColumn={withStickyFirstColumn}
        />
    );

    if (withStickyHeader || withStickyFirstColumn) {
        return (
            <StickyViewGrid
                className={cx(tcls(style), 'table-view')}
                stickyHeader={withStickyHeader}
                tableClassName={tableContainerClassName}
                withTableRole={false}
                header={header}
            >
                {body}
            </StickyViewGrid>
        );
    }

    return (
        <div className={cx(tcls(style), 'table-view')}>
            <div className="table-scroll">
                <div className={cx('table-stack', tableContainerClassName)}>
                    {header}
                    {body}
                </div>
            </div>
        </div>
    );
}

function NativeViewGridHeader(
    props: TableGridViewProps & {
        stickyHeader: boolean;
        stickyFirstColumn: boolean;
        className?: string;
    }
) {
    const { block, view, stickyHeader, stickyFirstColumn, className } = props;
    const firstVisibleColumn = view.columns[0];

    return (
        <div
            aria-hidden="true"
            className={cx(
                'table-native-header',
                (stickyHeader || !stickyFirstColumn) && 'table-header-clip',
                className
            )}
        >
            <table className="table-native">
                <NativeViewGridColumns {...props} />
                <thead>
                    <tr>
                        {view.columns.map((column) => {
                            const definition = block.data.definition[column];
                            if (!definition) {
                                return null;
                            }

                            const isStickyFirstColumn =
                                stickyFirstColumn && column === firstVisibleColumn;
                            return (
                                <th
                                    key={column}
                                    scope="col"
                                    className={cx(
                                        'table-header-cell',
                                        isStickyFirstColumn
                                            ? stickyHeader
                                                ? 'table-header-cell-pinned'
                                                : 'table-header-cell-sticky'
                                            : undefined,
                                        getColumnAlignment(definition)
                                    )}
                                    style={{
                                        left:
                                            stickyHeader && isStickyFirstColumn
                                                ? 'calc(-1 * var(--table-sticky-scroll-left, 0px))'
                                                : undefined,
                                    }}
                                    title={definition.title}
                                >
                                    {definition.title}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
            </table>
        </div>
    );
}

function NativeViewGridBody(
    props: TableGridViewProps & {
        withHeader: boolean;
        stickyFirstColumn: boolean;
    }
) {
    const { block, view, records, withHeader, stickyFirstColumn, cellMergeLayout, context } = props;
    const firstVisibleColumn = view.columns[0];
    const lastVisibleColumn = view.columns.at(-1);
    const recordsById = new Map(records.map((record) => [record[0], record] as const));
    const recordIndexes = new Map(records.map((record, index) => [record[0], index] as const));

    return (
        <TableHoverTable className="table-native table-native-body">
            <NativeViewGridColumns {...props} />
            {withHeader ? (
                <thead className="sr-only">
                    <tr>
                        {view.columns.map((column) => {
                            const definition = block.data.definition[column];
                            return definition ? (
                                <th key={column} scope="col">
                                    {definition.title}
                                </th>
                            ) : null;
                        })}
                    </tr>
                </thead>
            ) : null}
            {cellMergeLayout.recordGroups.map((recordGroup) => (
                <TableSearchTableBody key={recordGroup[0]} recordIds={recordGroup}>
                    {recordGroup.map((recordId) => {
                        const record = recordsById.get(recordId);
                        const recordIndex = recordIndexes.get(recordId);
                        if (!record || recordIndex === undefined) {
                            return null;
                        }

                        return (
                            <tr key={recordId}>
                                {view.columns.map((column) => {
                                    const cellMerge = getTableCellMerge(
                                        cellMergeLayout,
                                        recordId,
                                        column
                                    );
                                    if (cellMerge && !cellMerge.isAnchor) {
                                        return null;
                                    }

                                    const definition = block.data.definition[column];
                                    if (!definition) {
                                        return null;
                                    }

                                    const verticalAlignment =
                                        getColumnVerticalAlignment(definition);
                                    const renderedColumns = cellMerge?.merge.columns ?? [column];
                                    const isLastColumn =
                                        renderedColumns.at(-1) === lastVisibleColumn;
                                    const isStickyFirstColumn =
                                        stickyFirstColumn && column === firstVisibleColumn;
                                    const rowSpan =
                                        cellMerge && cellMerge.merge.rowSpan > 1
                                            ? cellMerge.merge.rowSpan
                                            : undefined;
                                    const colSpan =
                                        cellMerge && cellMerge.merge.colSpan > 1
                                            ? cellMerge.merge.colSpan
                                            : undefined;
                                    return (
                                        <td
                                            key={column}
                                            rowSpan={rowSpan}
                                            colSpan={colSpan}
                                            aria-rowspan={rowSpan}
                                            aria-colspan={colSpan}
                                            {...getCommentCellProps(context, recordId, column)}
                                            data-table-row-start={recordIndex}
                                            data-table-row-end={
                                                recordIndex + (cellMerge?.merge.rowSpan ?? 1) - 1
                                            }
                                            className={cx(
                                                'table-native-cell',
                                                !isLastColumn && 'table-native-cell-divider',
                                                getNativeCellVerticalAlignment(verticalAlignment),
                                                isStickyFirstColumn && 'table-native-cell-sticky'
                                            )}
                                        >
                                            <RecordColumnValue
                                                {...props}
                                                record={record}
                                                column={column}
                                                verticalAlignment={verticalAlignment}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </TableSearchTableBody>
            ))}
        </TableHoverTable>
    );
}

function NativeViewGridColumns(props: TableGridViewProps) {
    const { block, view, context } = props;
    const { columnWidths, autoSizedColumns, fixedColumns } = getViewGridLayout({
        block,
        view,
        mode: context.mode,
    });

    return (
        <colgroup>
            {view.columns.map((column) => (
                <col
                    key={column}
                    style={{
                        width: getColumnWidth({
                            column,
                            columnWidths,
                            autoSizedColumns,
                            fixedColumns,
                        }),
                    }}
                />
            ))}
        </colgroup>
    );
}

function getNativeCellVerticalAlignment(verticalAlignment: VerticalAlignment) {
    switch (verticalAlignment) {
        case 'self-start':
            return 'align-top';
        case 'self-end':
            return 'align-bottom';
        case 'self-center':
            return 'align-middle';
    }
}
