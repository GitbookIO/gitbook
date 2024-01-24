import { LinkProps } from 'next/link';
import { useQueryStates, parseAsBoolean, parseAsString, UseQueryStatesOptions } from 'nuqs';
import React from 'react';

export interface SearchState {
    query: string;
    ask: boolean;
    global: boolean;
}

// KeyMap needs to be statically defined to avoid `setRawState` being redefined on every render.
const keyMap = {
    q: parseAsString,
    ask: parseAsBoolean,
    global: parseAsBoolean,
};

const options: UseQueryStatesOptions = {
    history: 'replace',
};

/**
 * Hook to access the current search query and update it.
 */
export function useSearch(): [
    SearchState | null,
    (update: React.SetStateAction<SearchState | null>) => Promise<URLSearchParams>,
] {
    const [rawState, setRawState] = useQueryStates(keyMap, options);

    const state = React.useMemo<SearchState | null>(() => {
        if (rawState === null || rawState.q === null) {
            return null;
        }

        return { query: rawState.q, ask: !!rawState.ask, global: !!rawState.global };
    }, [rawState]);

    const stateRef = React.useRef(state);
    React.useLayoutEffect(() => {
        stateRef.current = state;
    }, [state]);

    const setState = React.useCallback<
        (update: React.SetStateAction<SearchState | null>) => Promise<URLSearchParams>
    >(
        (update) => {
            if (typeof update === 'function') {
                update = update(stateRef.current);
            }

            if (update === null) {
                return setRawState({
                    q: null,
                    ask: null,
                    global: null,
                });
            } else {
                return setRawState({
                    q: update.query,
                    ask: update.ask ? true : null,
                    global: update.global ? true : null,
                });
            }
        },
        [setRawState],
    );

    return [state, setState];
}

/**
 * Hook to create a link to a search query.
 */
export function useSearchLink(): (query: Partial<SearchState>) => LinkProps {
    const [, setSearch] = useSearch();

    return React.useCallback(
        (query) => {
            const searchParams = new URLSearchParams();
            searchParams.set('q', query.query ?? '');
            query.ask ? searchParams.set('ask', 'on') : searchParams.delete('ask');
            query.global ? searchParams.set('global', 'on') : searchParams.delete('global');
            return {
                href: '?' + searchParams.toString(),
                prefetch: false,
                onClick: (event) => {
                    event.preventDefault();
                    setSearch((prev) => ({
                        query: '',
                        ask: false,
                        global: false,
                        ...(prev ?? {}),
                        ...query,
                    }));
                },
            };
        },
        [setSearch],
    );
}
