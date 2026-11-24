import { describe, expect, it } from 'bun:test';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

import { SearchContextProvider, shouldKeepSearchState, useSearchState } from './useSearch';

function SearchScopeValue() {
    return useSearchState()?.scope ?? null;
}

describe('shouldKeepSearchState', () => {
    it('discards an empty default search state', () => {
        expect(
            shouldKeepSearchState({
                q: null,
                ask: null,
                scope: 'default',
            })
        ).toBe(false);
    });

    it('keeps a non-default scope without a query', () => {
        expect(
            shouldKeepSearchState({
                q: null,
                ask: null,
                scope: 'current',
            })
        ).toBe(true);
    });
});

it.each([
    ['scope=all', 'default'],
    ['global=true', 'default'],
    ['scope=current&global=true', 'current'],
    ['scope=extended&global=true', 'extended'],
])('resolves %s to %s for a linked search', (params, scope) => {
    const search = createElement(
        SearchContextProvider,
        { prewarmURL: '/~gitbook/search' },
        createElement(SearchScopeValue)
    );

    expect(
        renderToString(
            createElement(NuqsTestingAdapter, {
                searchParams: `q=setup&${params}`,
                children: search,
            })
        )
    ).toBe(scope);
});
