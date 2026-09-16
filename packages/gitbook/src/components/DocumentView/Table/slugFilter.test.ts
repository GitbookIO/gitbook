import { describe, expect, it } from 'bun:test';

import type { TableSelectColumn } from './search';
import { resolveSlugFilter, slugFilterKey } from './slugFilter';

function column(id: string, values: string[]): TableSelectColumn {
    return {
        id,
        label: id,
        options: values.map((value) => ({ value, label: value, color: 'blue' })),
    };
}

describe('resolveSlugFilter', () => {
    const platform = column('platform', ['macos', 'windows', 'linux']);
    const status = column('status', ['done', 'todo']);

    it('narrows a column the selection names', () => {
        expect(resolveSlugFilter([platform], ['macos'])).toEqual({ platform: 'macos' });
    });

    it('leaves a column the selection says nothing about', () => {
        expect(resolveSlugFilter([platform, status], ['macos'])).toEqual({ platform: 'macos' });
    });

    it('narrows several columns at once when the selection covers both', () => {
        expect(resolveSlugFilter([platform, status], ['macos', 'done'])).toEqual({
            platform: 'macos',
            status: 'done',
        });
    });

    it('takes the most recently activated when a column offers several active options', () => {
        // Most-recent-first, so `windows` wins over `macos` — the rule tabs resolve with.
        expect(resolveSlugFilter([platform], ['windows', 'macos'])).toEqual({
            platform: 'windows',
        });
        expect(resolveSlugFilter([platform], ['macos', 'windows'])).toEqual({ platform: 'macos' });
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
