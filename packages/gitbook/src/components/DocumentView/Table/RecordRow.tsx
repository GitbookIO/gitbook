import type { DocumentTableViewGrid } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { RecordColumnValue } from './RecordColumnValue';
import type { TableRecordKV, TableViewProps } from './Table';
import { getColumnWidth } from './layout';
import { getColumnVerticalAlignment } from './utils';

export function RecordRow(
    props: TableViewProps<DocumentTableViewGrid> & {
        record: TableRecordKV;
        autoSizedColumns: string[];
        fixedColumns: string[];
    }
) {
    const { view, autoSizedColumns, fixedColumns, block, context } = props;
    const stickyFirstColumn = context.mode !== 'print' && view.stickyFirstColumn === true;
    const firstVisibleColumn = view.columns[0];

    return (
        <div
            className={tcls(
                'group/row flex',
                'border-tint-subtle',
                'transition-colors',
                'hover:bg-tint-hover'
            )}
            role="row"
        >
            {view.columns.map((column) => {
                const columnWidth = getColumnWidth({
                    column,
                    columnWidths: context.mode === 'print' ? undefined : view.columnWidths,
                    autoSizedColumns,
                    fixedColumns,
                });
                const isStickyFirstColumnCell = stickyFirstColumn && column === firstVisibleColumn;
                // @ts-expect-error
                const verticalAlignment = getColumnVerticalAlignment(block.data.definition[column]);

                return (
                    <div
                        key={column}
                        role="cell"
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
        </div>
    );
}
