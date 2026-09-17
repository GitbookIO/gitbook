import { describe, expect, it } from 'bun:test';

import type { TableSelectColumn } from './search';
import {
    getAppliedSlugFilter,
    getOptionSlug,
    reconcileSelectedOptions,
    resolveSlugFilter,
    slugFilterKey,
} from './slugFilter';

/**
 * A select column as the editor writes one: each option carries an opaque generated `value` and the
 * author's wording as its `label`. Tests must not conflate the two — matching on `value` looks
 * right against fixtures that reuse the label and matches nothing against real content.
 */
function column(id: string, labels: string[]): TableSelectColumn {
    return {
        id,
        label: id,
        options: labels.map((label, index) => ({
            value: `${id}-key-${index}`,
            label,
            color: 'blue',
        })),
    };
}

/** The opaque value of the option an author labelled `label`. */
function valueOf(column: TableSelectColumn, label: string): string {
    const option = column.options.find((option) => option.label === label);
    if (!option) {
        throw new Error(`no option labelled ${label}`);
    }
    return option.value;
}

describe('resolveSlugFilter', () => {
    const platform = column('platform', ['macOS', 'Windows', 'Linux']);
    const status = column('status', ['Done', 'To do']);

    it('matches the option label, and resolves to its opaque value', () => {
        expect(resolveSlugFilter([platform], ['macos'])).toEqual([
            {
                column: 'platform',
                value: valueOf(platform, 'macOS'),
                label: 'macOS',
                slug: 'macos',
            },
        ]);
    });

    it('carries the label and slug needed to show and clear the filter', () => {
        // The reader is told what narrowed the table, and the slug is what clearing deactivates.
        const [entry] = resolveSlugFilter([platform], ['windows']);
        expect(entry?.label).toBe('Windows');
        expect(entry?.slug).toBe('windows');
    });

    it('never matches the opaque value itself', () => {
        expect(resolveSlugFilter([platform], [valueOf(platform, 'macOS')])).toEqual([]);
    });

    it('slugifies the label the way every other select surface does', () => {
        const languages = column('language', ['Node.js', 'C++', 'Windows 10']);
        expect(resolveSlugFilter([languages], ['node.js'])[0]?.label).toBe('Node.js');
        expect(resolveSlugFilter([languages], ['c++'])[0]?.label).toBe('C++');
        expect(resolveSlugFilter([languages], ['windows-10'])[0]?.label).toBe('Windows 10');
    });

    it('falls back to the value when an option has no label', () => {
        const legacy: TableSelectColumn = {
            id: 'legacy',
            label: 'legacy',
            options: [{ value: 'macos', label: '', color: 'blue' }],
        };
        expect(resolveSlugFilter([legacy], ['macos'])).toEqual([
            { column: 'legacy', value: 'macos', label: 'macos', slug: 'macos' },
        ]);
    });

    it('leaves a column the selection says nothing about', () => {
        const entries = resolveSlugFilter([platform, status], ['macos']);
        expect(entries.map((entry) => entry.column)).toEqual(['platform']);
    });

    it('narrows several columns at once when the selection covers both', () => {
        const entries = resolveSlugFilter([platform, status], ['macos', 'done']);
        expect(entries.map((entry) => entry.value)).toEqual([
            valueOf(platform, 'macOS'),
            valueOf(status, 'Done'),
        ]);
    });

    it('takes the most recently activated when a column offers several active options', () => {
        // Most-recent-first, so `windows` wins over `macos` — the rule tabs resolve with.
        expect(resolveSlugFilter([platform], ['windows', 'macos'])[0]?.value).toBe(
            valueOf(platform, 'Windows')
        );
        expect(resolveSlugFilter([platform], ['macos', 'windows'])[0]?.value).toBe(
            valueOf(platform, 'macOS')
        );
    });

    it('filters nothing when the selection matches no column', () => {
        expect(resolveSlugFilter([platform, status], ['python'])).toEqual([]);
        expect(resolveSlugFilter([platform], [])).toEqual([]);
        expect(resolveSlugFilter([], ['macos'])).toEqual([]);
    });
});

describe('getOptionSlug', () => {
    // Shared by the matcher and by the write-back that moves the selection when a reader changes a
    // governed column, so the two can never disagree about what an option answers to.
    it('slugifies the label, and falls back to the value', () => {
        expect(getOptionSlug({ value: 'key-0', label: 'macOS' })).toBe('macos');
        expect(getOptionSlug({ value: 'key-1', label: 'Windows 10' })).toBe('windows-10');
        expect(getOptionSlug({ value: 'macos', label: '' })).toBe('macos');
    });
});

describe('reconcileSelectedOptions', () => {
    const entry = (column: string, value: string) => ({
        column,
        value,
        label: value,
        slug: value,
    });

    it('drops the column when the selection is cleared', () => {
        const previous = { platform: new Set(['macos-value']) };
        expect(reconcileSelectedOptions(previous, ['platform'], [])).toEqual({});
    });

    it('leaves filters the reader set themselves', () => {
        const previous = {
            platform: new Set(['macos-value']),
            status: new Set(['done-value']),
        };
        expect(reconcileSelectedOptions(previous, ['platform'], [])).toEqual({
            status: new Set(['done-value']),
        });
    });

    it('replaces the previous selection rather than adding to it', () => {
        const previous = { platform: new Set(['macos-value']) };
        expect(
            reconcileSelectedOptions(previous, ['platform'], [entry('platform', 'windows-value')])
        ).toEqual({ platform: new Set(['windows-value']) });
    });

    it('gives the same answer however many times it is applied', () => {
        // React may invoke a state updater more than once with the same input. An earlier version
        // tracked the narrowed columns inside the updater, so the second pass saw them already
        // cleared, took the early return and handed back the *unchanged* state — silently undoing
        // a clear while leaving an apply working, which is exactly how it presented.
        const previous = { platform: new Set(['macos-value']) };
        const once = reconcileSelectedOptions(previous, ['platform'], []);
        const twice = reconcileSelectedOptions(previous, ['platform'], []);
        expect(twice).toEqual(once);
    });

    it('is a no-op when there is nothing to narrow and nothing to undo', () => {
        const previous = { status: new Set(['done-value']) };
        expect(reconcileSelectedOptions(previous, [], [])).toBe(previous);
    });
});

describe('getAppliedSlugFilter', () => {
    const macos = { column: 'platform', value: 'macos-value', label: 'macOS', slug: 'macos' };

    it('speaks for a column the reader has left alone', () => {
        const selected = { platform: new Set(['macos-value']) };
        expect(getAppliedSlugFilter([macos], selected)).toEqual([macos]);
    });

    it('drops a column the reader has filtered to something else', () => {
        // Changing the filter deliberately leaves the selection active, so the slug is still there;
        // the notice just must not claim a match the table is no longer showing.
        const selected = { platform: new Set(['windows-value']) };
        expect(getAppliedSlugFilter([macos], selected)).toEqual([]);
    });

    it('drops a column the reader has widened to several options', () => {
        const selected = { platform: new Set(['macos-value', 'windows-value']) };
        expect(getAppliedSlugFilter([macos], selected)).toEqual([]);
    });

    it('drops a column the reader has cleared', () => {
        expect(getAppliedSlugFilter([macos], {})).toEqual([]);
    });
});

describe('slugFilterKey', () => {
    const entry = (column: string, value: string) => ({
        column,
        value,
        label: value,
        slug: value,
    });

    it('is stable whatever order the columns resolve in', () => {
        expect(slugFilterKey([entry('platform', 'macos'), entry('status', 'done')])).toBe(
            slugFilterKey([entry('status', 'done'), entry('platform', 'macos')])
        );
    });

    it('changes when the selection moves', () => {
        expect(slugFilterKey([entry('platform', 'macos')])).not.toBe(
            slugFilterKey([entry('platform', 'linux')])
        );
    });

    it('is empty when nothing is filtered', () => {
        expect(slugFilterKey([])).toBe('');
    });
});
