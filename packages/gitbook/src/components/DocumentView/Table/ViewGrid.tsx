import type { DocumentTableViewGrid } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { RecordRow } from './RecordRow';
import type { TableViewProps } from './Table';
import styles from './table.module.css';
import { getColumnAlignment } from './utils';

/* Columns are sized in 3 ways:
     1. Set to auto-size by default, these columns share the available width
     2. Explicitly set by the user by dragging column separator (we then turn off auto-size)
     3. Auto-size is turned off without setting a width, we then default to a fixed width of 100px
*/
export function ViewGrid(props: TableViewProps<DocumentTableViewGrid>) {
    const { block, view, records, style, context } = props;

    /* Calculate how many columns are auto-sized vs fixed width */
    const columnWidths = context.mode === 'print' ? undefined : view.columnWidths;
    const autoSizedColumns = view.columns.filter((column) => !columnWidths?.[column]);
    const fixedColumns = view.columns.filter((column) => columnWidths?.[column]);

    const tableWidth = autoSizedColumns.length > 0 ? 'w-full' : 'w-fit';

    /* Only show the header when configured and not empty */
    const withHeader =
        !view.hideHeader &&
        view.columns.some(
            (columnId) => (block.data.definition[columnId]?.title.trim().length ?? 0) > 0
        );

    return (
        <div className={tcls(style, styles.tableWrapper)}>
            {/* Table */}
            <div role="table" className={tcls('flex', 'flex-col')}>
                {/* Header */}
                {withHeader && (
                    <div
                        role="rowgroup"
                        className={tcls(
                            tableWidth,
                            styles.rowGroup,
                            'straight-corners:rounded-none',
                            'circular-corners:rounded-xl'
                        )}
                    >
                        <div role="row" className={tcls('flex', 'w-full')}>
                            {view.columns.map((column) => {
                                const definition = block.data.definition[column]!;
                                return (
                                    <div
                                        key={column}
                                        role="columnheader"
                                        className={tcls(
                                            styles.columnHeader,
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
                )}
                <div
                    role="rowgroup"
                    className={tcls('flex', 'flex-col', tableWidth, '[&>*+*]:border-t')}
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
            </div>
        </div>
    );
}

export const getColumnWidth = ({
    column,
    columnWidths,
    autoSizedColumns,
    fixedColumns,
}: {
    column: string;
    columnWidths: Record<string, number> | undefined;
    autoSizedColumns: string[];
    fixedColumns: string[];
}) => {
    const columnWidth = columnWidths?.[column];

    /* Column was explicitly set by user or user turned off auto-sizing (in that case, columnWidth should've also been set to 100px) */
    if (columnWidth) return `${columnWidth}px`;

    /* Fallback minimum width for columns, so the columns don't become unreadable from being too narrow and instead table will become scrollable. */
    const minAutoColumnWidth = '100px';

    const totalFixedWidth = fixedColumns.reduce((sum, col) => {
        return sum + (columnWidths?.[col] || 0);
    }, 0);

    /* Column should use auto-sizing, which means it grows to fill available space */
    const availableWidth = `calc((100% - ${totalFixedWidth}px) / ${autoSizedColumns.length})`;
    return `clamp(${minAutoColumnWidth}, ${availableWidth}, 100%)`;
};
