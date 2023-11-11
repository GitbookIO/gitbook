import { usePathname } from 'next/navigation';
import React from 'react';
import { atom, useRecoilState } from 'recoil';

const searchQueryState = atom<string | null>({
    key: 'searchQueryState',
    default: null,
    effects: [
        ({ setSelf, onSet }) => {
            if (typeof window !== 'undefined') {
                setTimeout(() => {
                    setSelf(getCurrentSearchQuery());
                }, 1);
            }

            onSet((query, previousQuery) => {
                if (query === previousQuery) {
                    return;
                }

                const state = {};
                const title = window.document.title;
                const searchParams = new URLSearchParams(window.location.search);

                if (query === null) {
                    if (!searchParams.has('q')) {
                        return;
                    }

                    searchParams.delete('q');
                } else {
                    if (searchParams.get('q') === query) {
                        return;
                    }

                    searchParams.set('q', query);
                }

                const url =
                    window.location.pathname +
                    (searchParams.size ? '?' + searchParams.toString() : '');

                if (previousQuery === null && query !== null) {
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
export function useSearch(): [string | null, (query: string | null) => void] {
    const [query, setQuery] = useRecoilState(searchQueryState);
    return [query, setQuery];
}

function getCurrentSearchQuery() {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('q') ?? null;
}
