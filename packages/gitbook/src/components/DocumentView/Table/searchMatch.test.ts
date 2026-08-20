import { describe, expect, it } from 'bun:test';

import {
    type SelectedOptions,
    type TableSearchRecordData,
    getVisibleTableRecordIds,
    matchesText,
    recordMatches,
} from './searchMatch';

const NO_OPTIONS: SelectedOptions = {};
const NO_CHECKBOXES: ReadonlySet<string> = new Set();

function visibleIds(
    records: TableSearchRecordData[],
    filters: {
        query?: string;
        selectedOptions?: SelectedOptions;
        checkedColumns?: ReadonlySet<string>;
    },
    recordGroups: string[][] = []
) {
    return getVisibleTableRecordIds({
        records,
        recordGroups,
        query: filters.query ?? '',
        selectedOptions: filters.selectedOptions ?? NO_OPTIONS,
        checkedColumns: filters.checkedColumns ?? NO_CHECKBOXES,
    });
}

function match(
    record: {
        searchText?: string;
        selectValues?: Record<string, string[]>;
        checkboxValues?: Record<string, boolean>;
    },
    filters: {
        query?: string;
        selectedOptions?: SelectedOptions;
        checkedColumns?: ReadonlySet<string>;
    }
): boolean {
    return recordMatches(
        record.searchText ?? '',
        record.selectValues,
        record.checkboxValues,
        filters.query ?? '',
        filters.selectedOptions ?? NO_OPTIONS,
        filters.checkedColumns ?? NO_CHECKBOXES
    );
}

describe('matchesText', () => {
    it('matches everything when the query is empty', () => {
        expect(matchesText('anything', '')).toBe(true);
        expect(matchesText('', '   ')).toBe(true);
    });

    it('matches case-insensitively', () => {
        expect(matchesText('Hello World', 'hello')).toBe(true);
        expect(matchesText('Hello World', 'nope')).toBe(false);
    });

    it('matches regex metacharacters literally', () => {
        expect(matchesText('value a+b here', 'a+b')).toBe(true);
        expect(matchesText('v1x2', 'v1.2')).toBe(false);
        expect(matchesText('a (b) c', '(b)')).toBe(true);
    });
});

describe('recordMatches', () => {
    it('shows every record when no filter is active', () => {
        expect(match({ searchText: 'whatever' }, {})).toBe(true);
    });

    it('applies the text filter', () => {
        expect(match({ searchText: 'Ace AI' }, { query: 'ace' })).toBe(true);
        expect(match({ searchText: 'Ace AI' }, { query: 'discrete' })).toBe(false);
    });

    describe('select columns', () => {
        const selectedStatus: SelectedOptions = { status: new Set(['active', 'pending']) };

        it('ORs multiple values within a single column', () => {
            expect(
                match(
                    { selectValues: { status: ['pending'] } },
                    { selectedOptions: selectedStatus }
                )
            ).toBe(true);
            expect(
                match(
                    { selectValues: { status: ['archived'] } },
                    { selectedOptions: selectedStatus }
                )
            ).toBe(false);
        });

        it('ANDs across different columns', () => {
            const filters: SelectedOptions = {
                status: new Set(['active']),
                tier: new Set(['gold']),
            };
            expect(
                match(
                    { selectValues: { status: ['active'], tier: ['gold'] } },
                    { selectedOptions: filters }
                )
            ).toBe(true);
            // Matches one column but not the other → excluded.
            expect(
                match(
                    { selectValues: { status: ['active'], tier: ['silver'] } },
                    { selectedOptions: filters }
                )
            ).toBe(false);
        });

        it('excludes records missing the column entirely', () => {
            expect(match({ selectValues: {} }, { selectedOptions: selectedStatus })).toBe(false);
        });
    });

    describe('checkbox columns', () => {
        const featured: ReadonlySet<string> = new Set(['featured']);

        it('keeps only records checked for the enabled column', () => {
            expect(
                match({ checkboxValues: { featured: true } }, { checkedColumns: featured })
            ).toBe(true);
            expect(
                match({ checkboxValues: { featured: false } }, { checkedColumns: featured })
            ).toBe(false);
            expect(match({ checkboxValues: {} }, { checkedColumns: featured })).toBe(false);
        });

        it('ANDs multiple enabled checkbox columns', () => {
            const both: ReadonlySet<string> = new Set(['featured', 'inStock']);
            expect(
                match(
                    { checkboxValues: { featured: true, inStock: true } },
                    { checkedColumns: both }
                )
            ).toBe(true);
            expect(
                match(
                    { checkboxValues: { featured: true, inStock: false } },
                    { checkedColumns: both }
                )
            ).toBe(false);
        });
    });

    it('ANDs the text, select and checkbox filters together', () => {
        const record = {
            searchText: 'Ace AI',
            selectValues: { status: ['active'] },
            checkboxValues: { featured: true },
        };
        const filters = {
            query: 'ace',
            selectedOptions: { status: new Set(['active']) } satisfies SelectedOptions,
            checkedColumns: new Set(['featured']),
        };

        expect(match(record, filters)).toBe(true);
        // Each individual filter failing flips the result to false.
        expect(match(record, { ...filters, query: 'discrete' })).toBe(false);
        expect(
            match(record, { ...filters, selectedOptions: { status: new Set(['archived']) } })
        ).toBe(false);
        expect(match({ ...record, checkboxValues: { featured: false } }, filters)).toBe(false);
    });
});

describe('getVisibleTableRecordIds', () => {
    const records: TableSearchRecordData[] = [
        {
            id: 'first',
            searchText: 'Anchor value',
            selectValues: { status: ['active'] },
            checkboxValues: { featured: false },
        },
        {
            id: 'second',
            searchText: 'Covered value',
            selectValues: { status: ['archived'] },
            checkboxValues: { featured: true },
        },
        {
            id: 'third',
            searchText: 'Connected value',
            selectValues: { status: ['pending'] },
            checkboxValues: { featured: false },
        },
        {
            id: 'unrelated',
            searchText: 'Unrelated value',
            selectValues: { status: ['archived'] },
            checkboxValues: { featured: false },
        },
    ];
    const verticalGroup = [['first', 'second']];

    it('returns null when no filter is active', () => {
        expect(visibleIds(records, {}, verticalGroup)).toBeNull();
    });

    it('keeps a complete vertical group when text matches its anchor', () => {
        expect(visibleIds(records, { query: 'anchor' }, verticalGroup)).toEqual(
            new Set(['first', 'second'])
        );
    });

    it('keeps a complete vertical group when select or checkbox filters match a grouped row', () => {
        expect(
            visibleIds(records, { selectedOptions: { status: new Set(['active']) } }, verticalGroup)
        ).toEqual(new Set(['first', 'second']));
        expect(
            visibleIds(records, { checkedColumns: new Set(['featured']) }, verticalGroup)
        ).toEqual(new Set(['second', 'first']));
    });

    it('excludes completely unmatched and disconnected groups', () => {
        expect(visibleIds(records, { query: 'unrelated' }, verticalGroup)).toEqual(
            new Set(['unrelated'])
        );
    });

    it('expands transitively connected groups in reversed metadata order without mutation', () => {
        const groups = [
            ['second', 'third'],
            ['first', 'second'],
        ];
        const originalGroups = groups.map((group) => [...group]);

        expect(visibleIds(records, { query: 'anchor' }, groups)).toEqual(
            new Set(['first', 'second', 'third'])
        );
        expect(groups).toEqual(originalGroups);
    });

    it('leaves cards independently filtered when no merge groups are provided', () => {
        expect(visibleIds(records, { query: 'anchor' })).toEqual(new Set(['first']));
    });
});
