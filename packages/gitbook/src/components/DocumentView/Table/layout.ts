import type { DocumentBlockTable, DocumentTableViewGrid } from '@gitbook/api';

import type { BlockProps } from '../Block';

export function hasVisibleHeader(block: DocumentBlockTable, view: DocumentTableViewGrid): boolean {
    return (
        !view.hideHeader &&
        view.columns.some(
            (columnId) => (block.data.definition[columnId]?.title.trim().length ?? 0) > 0
        )
    );
}

/* Columns are sized in 3 ways:
     1. Set to auto-size by default, these columns share the available width
     2. Explicitly set by the user by dragging column separator (we then turn off auto-size)
     3. Auto-size is turned off without setting a width, we then default to a fixed width of 100px
*/
export function getViewGridLayout({
    block,
    view,
    mode,
}: {
    block: DocumentBlockTable;
    view: DocumentTableViewGrid;
    mode: BlockProps<DocumentBlockTable>['context']['mode'];
}) {
    const columnWidths = mode === 'print' ? undefined : view.columnWidths;
    const autoSizedColumns = view.columns.filter((column) => !columnWidths?.[column]);
    const fixedColumns = view.columns.filter((column) => columnWidths?.[column]);
    const tableWidth = autoSizedColumns.length > 0 ? 'w-full' : 'w-fit';

    return {
        columnWidths,
        autoSizedColumns,
        fixedColumns,
        tableWidth,
        withHeader: hasVisibleHeader(block, view),
    };
}

/** How many columns `columnWidths.css` carries a `.gb-tcol-*` class for. */
export const MAX_COLUMN_WIDTH_VARS = 24;

/**
 * Custom properties holding each column's width, set once on the grid so the cells can point at
 * them instead of repeating the width in a style attribute of their own.
 */
export function getColumnWidthVars(args: {
    columns: string[];
    columnWidths: Record<string, number> | undefined;
    autoSizedColumns: string[];
    fixedColumns: string[];
}): Record<string, string> {
    const { columns, ...widthArgs } = args;
    const vars: Record<string, string> = {};
    columns.slice(0, MAX_COLUMN_WIDTH_VARS).forEach((column, index) => {
        vars[`--gb-tcol-${index}`] = getColumnWidth({ column, ...widthArgs });
    });
    return vars;
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
