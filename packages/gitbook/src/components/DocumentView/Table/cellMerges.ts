import type { DocumentBlockTable } from '@gitbook/api';

/**
 * Temporary compatibility type until the published `@gitbook/api` includes `cellMerges`.
 */
export interface TableCellMerge {
    anchor: {
        record: string;
        column: string;
    };
    rowSpan: number;
    colSpan: number;
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
    recordGroups: readonly (readonly string[])[];
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
        return {
            cells: new Map(),
            verticalRecordGroups: [],
            recordGroups: [],
            hasVerticalMerges: false,
        };
    }

    const columnOrder = block.data.view.columns;
    const candidates: { merge: ResolvedTableCellMerge; cellKeys: string[] }[] = [];
    const cells = new Map<string, Map<string, TableCellMergeSlot>>();
    const verticalRecordGroups: string[][] = [];

    for (const candidate of getRawTableCellMerges(block)) {
        const merge = resolveTableCellMerge(candidate, block, recordOrder, columnOrder);
        if (!merge) continue;

        const cellKeys = merge.records.flatMap((recordId) =>
            merge.columns.map((columnId) => getCellKey(recordId, columnId))
        );
        candidates.push({ merge, cellKeys });
    }

    const cellOwnerCounts = new Map<string, number>();
    for (const candidate of candidates) {
        for (const cellKey of candidate.cellKeys) {
            cellOwnerCounts.set(cellKey, (cellOwnerCounts.get(cellKey) ?? 0) + 1);
        }
    }

    for (const candidate of candidates) {
        if (candidate.cellKeys.some((cellKey) => cellOwnerCounts.get(cellKey) !== 1)) continue;
        const { merge } = candidate;

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
        recordGroups: groupConnectedRecords(recordOrder, verticalRecordGroups),
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

    const merge = candidate as {
        anchor?: { record?: unknown; column?: unknown };
        rowSpan?: unknown;
        colSpan?: unknown;
    };
    if (
        typeof merge.anchor?.record !== 'string' ||
        typeof merge.anchor.column !== 'string' ||
        typeof merge.rowSpan !== 'number' ||
        !Number.isInteger(merge.rowSpan) ||
        merge.rowSpan < 1 ||
        typeof merge.colSpan !== 'number' ||
        !Number.isInteger(merge.colSpan) ||
        merge.colSpan < 1 ||
        !(
            (merge.rowSpan === 1 && merge.colSpan >= 2) ||
            (merge.rowSpan >= 2 && merge.colSpan === 1)
        )
    ) {
        return null;
    }

    const recordStart = recordOrder.indexOf(merge.anchor.record);
    const columnStart = columnOrder.indexOf(merge.anchor.column);
    if (recordStart < 0 || columnStart < 0) {
        return null;
    }

    const records = recordOrder.slice(recordStart, recordStart + merge.rowSpan);
    const columns = columnOrder.slice(columnStart, columnStart + merge.colSpan);
    const recordsValid =
        records.length === merge.rowSpan &&
        records.every((recordId) => Boolean(block.data.records[recordId]));
    const definitions = columns.map((columnId) => block.data.definition[columnId]);
    const columnsValid =
        columns.length === merge.colSpan &&
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
        rowSpan: merge.rowSpan,
        colSpan: merge.colSpan,
    };
}

function getCellKey(recordId: string, columnId: string): string {
    return `${recordId.length}:${recordId}${columnId}`;
}

/** Partition records into ordered groups connected by one or more vertical merges. */
function groupConnectedRecords(
    recordOrder: readonly string[],
    connectedRecordGroups: readonly (readonly string[])[]
): string[][] {
    const parents = new Map(recordOrder.map((recordId) => [recordId, recordId]));

    const findRoot = (recordId: string): string => {
        const parent = parents.get(recordId);
        if (!parent || parent === recordId) {
            return recordId;
        }

        const root = findRoot(parent);
        parents.set(recordId, root);
        return root;
    };

    for (const group of connectedRecordGroups) {
        const firstRecordId = group[0];
        if (!firstRecordId) continue;

        for (const recordId of group.slice(1)) {
            parents.set(findRoot(recordId), findRoot(firstRecordId));
        }
    }

    const groupedRecords = new Map<string, string[]>();
    for (const recordId of recordOrder) {
        const root = findRoot(recordId);
        const group = groupedRecords.get(root);
        if (group) {
            group.push(recordId);
        } else {
            groupedRecords.set(root, [recordId]);
        }
    }

    return [...groupedRecords.values()];
}
