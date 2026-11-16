import { getColumnWidth, getViewGridLayout } from './layout';
import { RecordRow } from './RecordRow';
import type { TableGridViewProps } from './Table';
import { getColumnAlignment } from './utils';
import { cx } from '@/lib/classnames';

interface ViewGridHeaderProps extends TableGridViewProps {
    className?: string;
    tableClassName?: string;
}

interface ViewGridProps extends TableGridViewProps {
    tableClassName?: string;
}

export function ViewGridHeader(props: ViewGridHeaderProps) {
    const { block, view, context, className, tableClassName } = props;
    const { tableWidth, columnWidths, autoSizedColumns, fixedColumns } = getViewGridLayout({
        block,
        view,
        mode: context.mode,
    });
    const stickyFirstColumn = context.mode !== 'print' && view.stickyFirstColumn === true;
    const withStickyHeader = context.mode !== 'print' && view.stickyHeader === true;
    const firstVisibleColumn = view.columns[0];

    return (
        <div
            role="rowgroup"
            className={cx(
                tableClassName ?? tableWidth,
                'table-grid-header',
                (withStickyHeader || !stickyFirstColumn) && 'table-header-clip',
                className
            )}
        >
            <div role="row" className="table-grid-header-row">
                {view.columns.map((column) => {
                    const definition = block.data.definition[column];
                    if (!definition) {
                        return null;
                    }

                    return (
                        <div
                            key={column}
                            role="columnheader"
                            className={cx(
                                'table-header-cell',
                                stickyFirstColumn && column === firstVisibleColumn
                                    ? withStickyHeader
                                        ? 'table-header-cell-pinned'
                                        : 'table-header-cell-sticky'
                                    : undefined,
                                getColumnAlignment(definition)
                            )}
                            style={{
                                width: getColumnWidth({
                                    column,
                                    columnWidths,
                                    autoSizedColumns,
                                    fixedColumns,
                                }),
                                minWidth: columnWidths?.[column] || '100px',
                                left:
                                    withStickyHeader &&
                                    stickyFirstColumn &&
                                    column === firstVisibleColumn
                                        ? 'calc(-1 * var(--table-sticky-scroll-left, 0px))'
                                        : undefined,
                            }}
                            title={definition.title}
                        >
                            {definition.title}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function ViewGrid(props: ViewGridProps) {
    const { block, view, records, context, tableClassName } = props;
    const { tableWidth, autoSizedColumns, fixedColumns } = getViewGridLayout({
        block,
        view,
        mode: context.mode,
    });

    const body = (
        <div role="rowgroup" className={cx('table-grid-body', tableClassName ?? tableWidth)}>
            {records.map((record) => (
                <RecordRow
                    key={record[0]}
                    record={record}
                    autoSizedColumns={autoSizedColumns}
                    fixedColumns={fixedColumns}
                    {...props}
                />
            ))}
        </div>
    );

    return <div className={cx('table-stack', tableClassName ?? tableWidth)}>{body}</div>;
}
