import { describe, expect, it } from 'bun:test';

import type { TableSelectColumn } from './search';
import { resolveSlugFilter, slugFilterKey } from './slugFilter';

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
        expect(resolveSlugFilter([platform], ['macos'])).toEqual({
            platform: valueOf(platform, 'macOS'),
        });
    });

    it('never matches the opaque value itself', () => {
        expect(resolveSlugFilter([platform], [valueOf(platform, 'macOS')])).toEqual({});
    });

    it('slugifies the label the way every other select surface does', () => {
        const languages = column('language', ['Node.js', 'C++', 'Windows 10']);
        expect(resolveSlugFilter([languages], ['node.js'])).toEqual({
            language: valueOf(languages, 'Node.js'),
        });
        expect(resolveSlugFilter([languages], ['c++'])).toEqual({
            language: valueOf(languages, 'C++'),
        });
        expect(resolveSlugFilter([languages], ['windows-10'])).toEqual({
            language: valueOf(languages, 'Windows 10'),
        });
    });

    it('falls back to the value when an option has no label', () => {
        const legacy: TableSelectColumn = {
            id: 'legacy',
            label: 'legacy',
            options: [{ value: 'macos', label: '', color: 'blue' }],
        };
        expect(resolveSlugFilter([legacy], ['macos'])).toEqual({ legacy: 'macos' });
    });

    it('leaves a column the selection says nothing about', () => {
        expect(resolveSlugFilter([platform, status], ['macos'])).toEqual({
            platform: valueOf(platform, 'macOS'),
        });
    });

    it('narrows several columns at once when the selection covers both', () => {
        expect(resolveSlugFilter([platform, status], ['macos', 'done'])).toEqual({
            platform: valueOf(platform, 'macOS'),
            status: valueOf(status, 'Done'),
        });
    });

    it('takes the most recently activated when a column offers several active options', () => {
        // Most-recent-first, so `windows` wins over `macos` — the rule tabs resolve with.
        expect(resolveSlugFilter([platform], ['windows', 'macos'])).toEqual({
            platform: valueOf(platform, 'Windows'),
        });
        expect(resolveSlugFilter([platform], ['macos', 'windows'])).toEqual({
            platform: valueOf(platform, 'macOS'),
        });
    });

    it('filters nothing when the selection matches no column', () => {
        expect(resolveSlugFilter([platform, status], ['python'])).toEqual({});
        expect(resolveSlugFilter([platform], [])).toEqual({});
        expect(resolveSlugFilter([], ['macos'])).toEqual({});
    });
});

describe('slugFilterKey', () => {
    it('is stable whatever order the columns resolve in', () => {
        expect(slugFilterKey({ platform: 'macos', status: 'done' })).toBe(
            slugFilterKey({ status: 'done', platform: 'macos' })
        );
    });

    it('changes when the selection moves', () => {
        expect(slugFilterKey({ platform: 'macos' })).not.toBe(slugFilterKey({ platform: 'linux' }));
    });

    it('is empty when nothing is filtered', () => {
        expect(slugFilterKey({})).toBe('');
    });
});
