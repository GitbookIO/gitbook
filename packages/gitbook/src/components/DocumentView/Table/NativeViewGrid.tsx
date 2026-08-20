import { getTableCellMerge } from './cellMerges';
import { getColumnWidth, getViewGridLayout, hasVisibleHeader } from './layout';
import { RecordColumnValue } from './RecordColumnValue';
import { StickyViewGrid } from './StickyViewGrid';
import type { TableGridViewProps } from './Table';
import { TableSearchTableRow } from './TableSearch';
import { type VerticalAlignment, getColumnAlignment, getColumnVerticalAlignment } from './utils';
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
            className={tcls(
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
                className={tcls(style, 'relative mx-auto grid w-full min-w-0')}
                stickyHeader={withStickyHeader}
                tableClassName={tableContainerClassName}
                header={header}
            >
                {body}
            </StickyViewGrid>
        );
    }

    return (
        <div className={tcls(style, 'relative mx-auto grid w-full min-w-0')}>
            <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-none border-tint-subtle">
                <div className={tcls('flex flex-col', tableContainerClassName)}>
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
            className={tcls(
                'mb-1 overflow-hidden rounded-lg border border-tint-subtle bg-tint',
                className
            )}
        >
            <table className="w-full table-fixed border-separate border-spacing-0">
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
                                    className={tcls(
                                        'relative px-3 py-2 font-medium text-sm text-tint-strong',
                                        isStickyFirstColumn
                                            ? stickyHeader
                                                ? 'z-20 bg-tint'
                                                : 'sticky left-0 z-20 bg-tint'
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
    const { block, view, records, withHeader, stickyFirstColumn, cellMergeLayout } = props;
    const firstVisibleColumn = view.columns[0];
    const lastVisibleColumn = view.columns.at(-1);

    return (
        <table className="w-full table-fixed border-separate border-spacing-0">
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
            <tbody
                className={tcls(
                    '[&>tr+tr>td]:border-t',
                    '[&>tr:hover:not(:has(>td[rowspan]:hover))>td:not([rowspan])]:bg-tint-hover'
                )}
            >
                {records.map((record) => (
                    <TableSearchTableRow key={record[0]} recordId={record[0]} className="group/row">
                        {view.columns.map((column) => {
                            const cellMerge = getTableCellMerge(cellMergeLayout, record[0], column);
                            if (cellMerge && !cellMerge.isAnchor) {
                                return null;
                            }

                            const definition = block.data.definition[column];
                            if (!definition) {
                                return null;
                            }

                            const verticalAlignment = getColumnVerticalAlignment(definition);
                            const renderedColumns = cellMerge?.merge.columns ?? [column];
                            const isLastColumn = renderedColumns.at(-1) === lastVisibleColumn;
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
                                    className={tcls(
                                        'relative px-3 py-2 text-sm transition-colors',
                                        !isLastColumn ? 'border-tint-subtle border-r' : undefined,
                                        getNativeCellVerticalAlignment(verticalAlignment),
                                        isStickyFirstColumn
                                            ? 'sticky left-0 z-10 bg-tint-base'
                                            : undefined
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
                    </TableSearchTableRow>
                ))}
            </tbody>
        </table>
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
