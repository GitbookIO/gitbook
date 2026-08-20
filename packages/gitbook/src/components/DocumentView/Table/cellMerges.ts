import type { DocumentBlockTable } from '@gitbook/api';

/**
 * Temporary compatibility type until the published `@gitbook/api` includes `cellMerges`.
 */
export interface TableCellMerge {
    records: string[];
    columns: string[];
}

type TableDataWithCellMerges = DocumentBlockTable['data'] & {
    cellMerges?: TableCellMerge[];
};

export interface ResolvedTableCellMerge {
    records: readonly string[];
    columns: readonly string[];
    rowSpan: number;
    colSpan: number;
}

export interface TableCellMergeSlot {
    merge: ResolvedTableCellMerge;
    isAnchor: boolean;
}

export interface TableCellMergeLayout {
    cells: ReadonlyMap<string, ReadonlyMap<string, TableCellMergeSlot>>;
    verticalRecordGroups: readonly (readonly string[])[];
    hasVerticalMerges: boolean;
}

/**
 * Resolve valid merge metadata once for a rendered grid.
 *
 * Invalid external metadata is ignored before any cell can be classified as covered, ensuring a
 * malformed merge always degrades to ordinary cells instead of hiding content.
 */
export function createTableCellMergeLayout(
    block: DocumentBlockTable,
    recordOrder: readonly string[]
): TableCellMergeLayout {
    if (block.data.view.type !== 'grid') {
        return { cells: new Map(), verticalRecordGroups: [], hasVerticalMerges: false };
    }

    const columnOrder = block.data.view.columns;
    const occupiedCells = new Set<string>();
    const cells = new Map<string, Map<string, TableCellMergeSlot>>();
    const verticalRecordGroups: string[][] = [];

    for (const candidate of getRawTableCellMerges(block)) {
        const merge = resolveTableCellMerge(candidate, block, recordOrder, columnOrder);
        if (!merge) {
            continue;
        }

        const cellKeys = merge.records.flatMap((recordId) =>
            merge.columns.map((columnId) => getCellKey(recordId, columnId))
        );
        if (cellKeys.some((key) => occupiedCells.has(key))) {
            continue;
        }

        cellKeys.forEach((key) => occupiedCells.add(key));
        for (const recordId of merge.records) {
            let row = cells.get(recordId);
            if (!row) {
                row = new Map();
                cells.set(recordId, row);
            }

            for (const columnId of merge.columns) {
                row.set(columnId, {
                    merge,
                    isAnchor: recordId === merge.records[0] && columnId === merge.columns[0],
                });
            }
        }

        if (merge.rowSpan > 1) {
            verticalRecordGroups.push([...merge.records]);
        }
    }

    return {
        cells,
        verticalRecordGroups,
        hasVerticalMerges: verticalRecordGroups.length > 0,
    };
}

/** Return the resolved merge classification for a logical table cell. */
export function getTableCellMerge(
    layout: TableCellMergeLayout,
    recordId: string,
    columnId: string
): TableCellMergeSlot | undefined {
    return layout.cells.get(recordId)?.get(columnId);
}

/** Combine the independent column widths used by a horizontal merged cell. */
export function getMergedCellWidth(widths: string[]): string {
    return widths.length === 1 && widths[0] ? widths[0] : `calc(${widths.join(' + ')})`;
}

function getRawTableCellMerges(block: DocumentBlockTable): unknown[] {
    const data = block.data as TableDataWithCellMerges;
    return Array.isArray(data.cellMerges) ? data.cellMerges : [];
}

function resolveTableCellMerge(
    candidate: unknown,
    block: DocumentBlockTable,
    recordOrder: readonly string[],
    columnOrder: readonly string[]
): ResolvedTableCellMerge | null {
    if (!candidate || typeof candidate !== 'object') {
        return null;
    }

    const { records, columns } = candidate as Partial<TableCellMerge>;
    if (
        !isUniqueStringArray(records) ||
        !isUniqueStringArray(columns) ||
        (records.length === 1 && columns.length < 2) ||
        (columns.length === 1 && records.length < 2) ||
        (records.length > 1 && columns.length > 1)
    ) {
        return null;
    }

    const recordsValid =
        isOrderedContiguous(recordOrder, records) &&
        records.every((recordId) => Boolean(block.data.records[recordId]));
    const definitions = columns.map((columnId) => block.data.definition[columnId]);
    const columnsValid =
        isOrderedContiguous(columnOrder, columns) &&
        definitions.every(
            (definition) => definition?.type === 'text' || definition?.type === 'number'
        ) &&
        definitions.every((definition) => definition?.type === definitions[0]?.type);
    if (!recordsValid || !columnsValid) {
        return null;
    }

    return {
        records: [...records],
        columns: [...columns],
        rowSpan: records.length,
        colSpan: columns.length,
    };
}

function isUniqueStringArray(value: unknown): value is string[] {
    return (
        Array.isArray(value) &&
        value.length > 0 &&
        value.every((item): item is string => typeof item === 'string') &&
        new Set(value).size === value.length
    );
}

function isOrderedContiguous(order: readonly string[], ids: readonly string[]): boolean {
    const start = order.indexOf(ids[0] ?? '');
    return start >= 0 && ids.every((id, index) => order[start + index] === id);
}

function getCellKey(recordId: string, columnId: string): string {
    return `${recordId.length}:${recordId}${columnId}`;
}
