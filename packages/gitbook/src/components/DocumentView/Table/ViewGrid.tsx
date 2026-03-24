import type { DocumentTableViewGrid } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { RecordRow } from './RecordRow';
import type { TableViewProps } from './Table';
import { getColumnWidth, getViewGridLayout } from './layout';
import { getColumnAlignment } from './utils';

interface ViewGridHeaderProps extends TableViewProps<DocumentTableViewGrid> {
    className?: string;
}

export function ViewGridHeader(props: ViewGridHeaderProps) {
    const { block, view, context, className } = props;
    const { tableWidth, columnWidths, autoSizedColumns, fixedColumns } = getViewGridLayout({
        block,
        view,
        mode: context.mode,
    });

    return (
        <div
            role="rowgroup"
            className={tcls(
                tableWidth,
                'mb-1 flex flex-col rounded-lg border border-tint-subtle bg-tint',
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
                                'px-3 py-2 font-medium text-sm text-tint-strong',
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

export function ViewGrid(props: TableViewProps<DocumentTableViewGrid>) {
    const { block, view, records, context } = props;
    const { tableWidth, autoSizedColumns, fixedColumns } = getViewGridLayout({
        block,
        view,
        mode: context.mode,
    });

    const body = (
        <div role="rowgroup" className={tcls('flex', 'flex-col', tableWidth, '[&>*+*]:border-t')}>
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
        <div role="table" className={tcls('flex', 'flex-col', 'w-fit')}>
            {body}
        </div>
    );
}
