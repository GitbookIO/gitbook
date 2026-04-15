import type { DocumentTableViewGrid } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { RecordRow } from './RecordRow';
import type { TableViewProps } from './Table';
import { getColumnWidth, getViewGridLayout } from './layout';
import { getColumnAlignment } from './utils';

interface ViewGridHeaderProps extends TableViewProps<DocumentTableViewGrid> {
    className?: string;
    tableClassName?: string;
}

interface ViewGridProps extends TableViewProps<DocumentTableViewGrid> {
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
    const isTranslatedStickyHeader = context.mode !== 'print' && view.stickyHeader === true;
    const firstVisibleColumn = view.columns[0];

    return (
        <div
            role="rowgroup"
            className={tcls(
                tableClassName ?? tableWidth,
                'mb-1 flex flex-col overflow-hidden rounded-lg border border-tint-subtle bg-tint',
                className
            )}
        >
            <div role="row" className={tcls('flex', 'w-full')}>
                {view.columns.map((column) => {
                    const definition = block.data.definition[column];
                    if (!definition) {
                        return null;
                    }

                    return (
                        <div
                            key={column}
                            role="columnheader"
                            className={tcls(
                                'relative px-3 py-2 font-medium text-sm text-tint-strong',
                                stickyFirstColumn && column === firstVisibleColumn
                                    ? isTranslatedStickyHeader
                                        ? 'z-20 bg-tint'
                                        : 'sticky left-0 z-20 bg-tint'
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
                                    isTranslatedStickyHeader &&
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
        <div
            role="rowgroup"
            className={tcls('flex', 'flex-col', tableClassName ?? tableWidth, '[&>*+*]:border-t')}
        >
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

    return (
        <div role="table" className={tcls('flex', 'flex-col', tableClassName ?? tableWidth)}>
            {body}
        </div>
    );
}
