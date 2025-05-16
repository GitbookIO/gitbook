import { parseAsBoolean, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import React from 'react';

import type { LinkProps } from '../primitives';

export interface SearchState {
    query: string;
    global: boolean;
    mode: 'results' | 'chat' | 'both';
    manual?: boolean;
}

// KeyMap needs to be statically defined to avoid `setRawState` being redefined on every render.
const keyMap = {
    q: parseAsString,
    mode: parseAsStringEnum(['both', 'results', 'chat']).withDefault('both'),
    global: parseAsBoolean,
    manual: parseAsBoolean,
};

export type UpdateSearchState = (
    update: React.SetStateAction<SearchState | null>
) => Promise<URLSearchParams>;

/**
 * Hook to access the current search query and update it.
 */
export function useSearch(): [SearchState | null, UpdateSearchState] {
    const [rawState, setRawState] = useQueryStates(keyMap, {
        history: 'replace',
    });

    const state = React.useMemo<SearchState | null>(() => {
        if (rawState === null || rawState.q === null) {
            return null;
        }

        return {
            query: rawState.q,
            mode: rawState.mode,
            global: !!rawState.global,
            manual: !!rawState.manual,
        };
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
                    mode: null,
                    global: null,
                    manual: null,
                });
            }
            return setRawState({
                q: update.query,
                mode: update.mode,
                global: update.global ? true : null,
                manual: update.manual ? true : null,
            });
        },
        [setRawState]
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
            query.mode ? searchParams.set('mode', query.mode) : searchParams.delete('mode');
            query.global ? searchParams.set('global', 'on') : searchParams.delete('global');
            searchParams.delete('manual');
            return {
                href: `?${searchParams.toString()}`,
                prefetch: false,
                onClick: (event) => {
                    event.preventDefault();
                    setSearch((prev) => ({
                        query: '',
                        mode: 'both',
                        global: false,
                        ...(prev ?? {}),
                        ...query,
                    }));
                },
            };
        },
        [setSearch]
    );
}
