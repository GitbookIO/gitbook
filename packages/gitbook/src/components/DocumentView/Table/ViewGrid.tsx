import type { DocumentTableViewGrid } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { RecordRow } from './RecordRow';
import type { TableViewProps } from './Table';
import { getColumnWidth, getViewGridLayout } from './layout';
import styles from './table.module.css';
import { getColumnAlignment } from './utils';

export function ViewGridHeader(
    props: TableViewProps<DocumentTableViewGrid> & { className?: string }
) {
    const { block, view, context, className } = props;
    const { tableWidth, columnWidths, autoSizedColumns, fixedColumns } = getViewGridLayout({
        block,
        view,
        mode: context.mode,
    });

    return (
        <div role="rowgroup" className={tcls(tableWidth, styles.rowGroup, className)}>
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
                            className={tcls(styles.columnHeader, getColumnAlignment(definition))}
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

export interface ViewGridProps extends TableViewProps<DocumentTableViewGrid> {
    headerClassName?: string;
}

export function ViewGrid(props: ViewGridProps) {
    const { block, view, records, context, headerClassName } = props;
    const { withHeader, tableWidth, autoSizedColumns, fixedColumns } = getViewGridLayout({
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
            {withHeader ? <ViewGridHeader {...props} className={headerClassName} /> : null}
            {body}
        </div>
    );
}
