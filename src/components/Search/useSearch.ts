import { LinkProps } from 'next/link';
import React from 'react';
import { atom, useRecoilState } from 'recoil';

export interface SearchState {
    query: string;
    ask: boolean;
}

const searchQueryState = atom<SearchState | null>({
    key: 'searchQueryState',
    default: null,
    effects: [
        ({ setSelf, onSet }) => {
            if (typeof window !== 'undefined') {
                setTimeout(() => {
                    setSelf(getCurrentSearchQuery());
                }, 1);
            }

            onSet((searchState, previousState) => {
                if (searchState === previousState) {
                    return;
                }

                const state = {};
                const title = window.document.title;
                const searchParams = new URLSearchParams(window.location.search);

                if (searchState === null) {
                    if (!searchParams.has('q') && !searchParams.has('ask')) {
                        return;
                    }

                    searchParams.delete('q');
                    searchParams.delete('ask');
                } else {
                    if (
                        searchParams.get('q') === searchState.query &&
                        searchParams.has('ask') === searchState.ask
                    ) {
                        return;
                    }

                    searchParams.set('q', searchState.query);
                    searchState.ask ? searchParams.set('ask', 'on') : searchParams.delete('ask');
                }

                const url =
                    window.location.pathname +
                    (searchParams.size ? '?' + searchParams.toString() : '');

                if (previousState === null && searchState !== null) {
                    window.history.pushState(state, title, url);
                } else {
                    window.history.replaceState(state, title, url);
                }
            });
        },
    ],
});

/**
 * Hook to access the current search query and update it.
 */
export function useSearch(): [SearchState | null, (query: SearchState | null) => void] {
    const [query, setQuery] = useRecoilState(searchQueryState);
    return [query, setQuery];
}

/**
 * Hook to create a link to a search query.
 */
export function useSearchLink(): (query: SearchState) => LinkProps {
    const [, setQuery] = useRecoilState(searchQueryState);

    return React.useCallback(
        (query) => {
            const searchParams = new URLSearchParams();
            searchParams.set('q', query.query);
            query.ask ? searchParams.set('ask', 'on') : searchParams.delete('ask');
            return {
                href: '?' + searchParams.toString(),
                prefetch: false,
                onClick: (event) => {
                    event.preventDefault();
                    setQuery(query);
                },
            };
        },
        [setQuery],
    );
}

function getCurrentSearchQuery(): SearchState | null {
    const searchParams = new URLSearchParams(window.location.search);
    const query = searchParams.get('q') ?? null;
    if (!query) {
        return null;
    }

    const ask = searchParams.has('ask');
    return { query, ask };
}
