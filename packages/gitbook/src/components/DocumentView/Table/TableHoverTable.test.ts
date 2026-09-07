import { describe, expect, it } from 'bun:test';

import { type TableRowRange, tableRowRangesIntersect } from './TableHoverTable';

const CELL_RANGES = {
    A: { rowStart: 0, rowEnd: 1 },
    B: { rowStart: 0, rowEnd: 0 },
    C: { rowStart: 0, rowEnd: 0 },
    D: { rowStart: 1, rowEnd: 1 },
    E: { rowStart: 1, rowEnd: 2 },
    F: { rowStart: 2, rowEnd: 2 },
    G: { rowStart: 2, rowEnd: 2 },
} satisfies Record<string, TableRowRange>;

function getHighlightedCells(hoveredCell: keyof typeof CELL_RANGES) {
    const hoveredRange = CELL_RANGES[hoveredCell];
    return Object.entries(CELL_RANGES)
        .filter(([, cellRange]) => tableRowRangesIntersect(cellRange, hoveredRange))
        .map(([cell]) => cell);
}

describe('tableRowRangesIntersect', () => {
    it.each([
        ['A', ['A', 'B', 'C', 'D', 'E']],
        ['B', ['A', 'B', 'C']],
        ['D', ['A', 'D', 'E']],
        ['E', ['A', 'D', 'E', 'F', 'G']],
    ] as const)(
        'highlights cells intersecting %s without transitive expansion',
        (cell, expected) => {
            expect(getHighlightedCells(cell)).toEqual([...expected]);
        }
    );

    it('treats a horizontal merge as a single-row range', () => {
        const horizontalMerge = { rowStart: 1, rowEnd: 1 };

        expect(
            Object.entries(CELL_RANGES)
                .filter(([, cellRange]) => tableRowRangesIntersect(cellRange, horizontalMerge))
                .map(([cell]) => cell)
        ).toEqual(['A', 'D', 'E']);
    });
});
