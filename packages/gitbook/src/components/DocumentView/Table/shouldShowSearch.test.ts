import { describe, expect, it } from 'bun:test';

import { MIN_RECORDS_FOR_SEARCH, shouldShowTableSearch } from './shouldShowSearch';

describe('shouldShowTableSearch', () => {
    describe('default (no override)', () => {
        it('shows search on a grid table once it reaches the row threshold', () => {
            expect(
                shouldShowTableSearch({
                    recordCount: MIN_RECORDS_FOR_SEARCH,
                    viewType: 'grid',
                    searchOverride: undefined,
                    isPrint: false,
                })
            ).toBe(true);
        });

        it('hides search on a grid table below the row threshold', () => {
            expect(
                shouldShowTableSearch({
                    recordCount: MIN_RECORDS_FOR_SEARCH - 1,
                    viewType: 'grid',
                    searchOverride: undefined,
                    isPrint: false,
                })
            ).toBe(false);
        });

        it('hides search on cards regardless of row count', () => {
            expect(
                shouldShowTableSearch({
                    recordCount: 100,
                    viewType: 'cards',
                    searchOverride: undefined,
                    isPrint: false,
                })
            ).toBe(false);
        });
    });

    describe('explicit override', () => {
        it('forces search on for a small grid table', () => {
            expect(
                shouldShowTableSearch({
                    recordCount: 1,
                    viewType: 'grid',
                    searchOverride: true,
                    isPrint: false,
                })
            ).toBe(true);
        });

        it('forces search on for cards', () => {
            expect(
                shouldShowTableSearch({
                    recordCount: 1,
                    viewType: 'cards',
                    searchOverride: true,
                    isPrint: false,
                })
            ).toBe(true);
        });

        it('forces search off for a large grid table', () => {
            expect(
                shouldShowTableSearch({
                    recordCount: 1000,
                    viewType: 'grid',
                    searchOverride: false,
                    isPrint: false,
                })
            ).toBe(false);
        });
    });

    it('never shows search when printing, even when forced on', () => {
        expect(
            shouldShowTableSearch({
                recordCount: 1000,
                viewType: 'grid',
                searchOverride: true,
                isPrint: true,
            })
        ).toBe(false);
    });
});
