'use client';

import { type ComponentPropsWithoutRef, type MouseEvent as ReactMouseEvent, useRef } from 'react';

const TABLE_CELL_SELECTOR = 'td[data-table-row-start][data-table-row-end]';

export interface TableRowRange {
    rowStart: number;
    rowEnd: number;
}

export function tableRowRangesIntersect(left: TableRowRange, right: TableRowRange) {
    return left.rowStart <= right.rowEnd && right.rowStart <= left.rowEnd;
}

/** Applies hover feedback to cells intersecting the hovered cell's original row span. */
export function TableHoverTable(props: ComponentPropsWithoutRef<'table'>) {
    const { onMouseOver, onMouseLeave, ...rest } = props;
    const hoveredCellRef = useRef<HTMLTableCellElement | null>(null);
    const highlightedCellsRef = useRef<Set<HTMLTableCellElement>>(new Set());

    const clearHighlightedCells = () => {
        for (const cell of highlightedCellsRef.current) {
            cell.removeAttribute('data-table-hovered');
        }
        highlightedCellsRef.current.clear();
        hoveredCellRef.current = null;
    };

    const handleMouseOver = (event: ReactMouseEvent<HTMLTableElement>) => {
        onMouseOver?.(event);

        const target = event.target;
        if (!(target instanceof Element)) {
            clearHighlightedCells();
            return;
        }

        const hoveredCell = target.closest<HTMLTableCellElement>(TABLE_CELL_SELECTOR);
        if (!hoveredCell || !event.currentTarget.contains(hoveredCell)) {
            clearHighlightedCells();
            return;
        }
        if (hoveredCellRef.current === hoveredCell) {
            return;
        }

        const hoveredRange = getTableCellRowRange(hoveredCell);
        if (!hoveredRange) {
            clearHighlightedCells();
            return;
        }

        const highlightedCells = new Set<HTMLTableCellElement>();
        for (const cell of event.currentTarget.querySelectorAll<HTMLTableCellElement>(
            TABLE_CELL_SELECTOR
        )) {
            const cellRange = getTableCellRowRange(cell);
            const highlighted =
                cellRange !== null && tableRowRangesIntersect(cellRange, hoveredRange);
            cell.toggleAttribute('data-table-hovered', highlighted);
            if (highlighted) {
                highlightedCells.add(cell);
            }
        }

        for (const cell of highlightedCellsRef.current) {
            if (!highlightedCells.has(cell)) {
                cell.removeAttribute('data-table-hovered');
            }
        }

        hoveredCellRef.current = hoveredCell;
        highlightedCellsRef.current = highlightedCells;
    };

    const handleMouseLeave = (event: ReactMouseEvent<HTMLTableElement>) => {
        onMouseLeave?.(event);
        clearHighlightedCells();
    };

    return <table {...rest} onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave} />;
}

function getTableCellRowRange(cell: HTMLTableCellElement): TableRowRange | null {
    const rowStart = Number(cell.dataset.tableRowStart);
    const rowEnd = Number(cell.dataset.tableRowEnd);
    if (!Number.isInteger(rowStart) || !Number.isInteger(rowEnd) || rowEnd < rowStart) {
        return null;
    }

    return { rowStart, rowEnd };
}
