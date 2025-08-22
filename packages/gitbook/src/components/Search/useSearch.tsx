'use client';

import { parseAsBoolean, parseAsString, useQueryStates } from 'nuqs';
import React from 'react';
import type { LinkProps } from '../primitives';

export interface SearchState {
    // URL-backed state
    query: string | null;
    ask: string | null;
    global: boolean;

    // Local UI state
    open: boolean;
}

// KeyMap needs to be statically defined to avoid `setRawState` being redefined on every render.
const keyMap = {
    q: parseAsString,
    ask: parseAsString,
    global: parseAsBoolean,
};

export type UpdateSearchState = (
    update: React.SetStateAction<SearchState | null>
) => Promise<URLSearchParams>;

// Imperative setter reference to allow non-React code to update search state
let externalSetSearchState: UpdateSearchState | null = null;

/**
 * Imperatively update the search state from non-React code.
 * No-op if the SearchContextProvider has not mounted yet.
 */
export function setSearchStateExternal(
    update: React.SetStateAction<SearchState | null>
): Promise<URLSearchParams> | undefined {
    if (externalSetSearchState) {
        return externalSetSearchState(update);
    }
}

/**
 * Context to share the search state updater so all consumers use the same instance.
 */
export const SearchContext = React.createContext<{
    state: SearchState | null;
    setState: UpdateSearchState;
} | null>(null);

export function SearchContextProvider(props: React.PropsWithChildren): React.ReactElement {
    const { children } = props;

    // URL-backed state
    const [rawState, setRawState] = useQueryStates(keyMap, {
        history: 'replace',
    });

    // Handle legacy ask=true format by converting it to the new format
    React.useEffect(() => {
        if (rawState?.ask === 'true' && rawState?.q) {
            // Convert legacy format: q=query&ask=true -> ask=query&q=null
            setRawState({
                q: null,
                ask: rawState.q,
                global: rawState.global,
            });
        }
    }, [rawState, setRawState]);

    // Local UI state for the popover open/close (not in URL)
    const [open, setIsOpen] = React.useState(() => {
        return rawState?.q !== null;
    });

    const state = React.useMemo<SearchState | null>(() => {
        if (rawState === null || (rawState.q === null && rawState.ask === null)) {
            return null;
        }
        return {
            query: rawState.q,
            ask: rawState.ask,
            global: !!rawState.global,
            open,
        };
    }, [rawState, open]);

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
                setIsOpen(false);
                return setRawState({ q: null, ask: null, global: null });
            }

            setIsOpen(update.open);
            return setRawState({
                q: update.query,
                ask: update.ask,
                global: update.global ? true : null,
            });
        },
        [setRawState]
    );

    // Expose the setter for imperative usage
    React.useEffect(() => {
        externalSetSearchState = setState;
        return () => {
            externalSetSearchState = null;
        };
    }, [setState]);

    return <SearchContext.Provider value={{ state, setState }}>{children}</SearchContext.Provider>;
}

/**
 * Hook to access the current search query and update it.
 */
export function useSearch(): [SearchState | null, UpdateSearchState] {
    const ctx = React.useContext(SearchContext);
    if (!ctx) {
        throw new Error('useSearch must be used within SearchContextProvider');
    }
    return [ctx.state, ctx.setState];
}

/**
 * Hook to create a link to a search query.
 */
export function useSearchLink(): (
    params: Partial<SearchState>,
    callback?: () => void
) => LinkProps {
    const [, setSearchState] = useSearch();

    return React.useCallback(
        (params, callback) => {
            const searchParams = new URLSearchParams();
            params.query ? searchParams.set('q', params.query) : searchParams.delete('q');
            params.ask ? searchParams.set('ask', params.ask) : searchParams.delete('ask');
            params.global ? searchParams.set('global', 'true') : searchParams.delete('global');
            return {
                href: `?${searchParams.toString()}`,
                prefetch: false,
                onClick: (event) => {
                    event.preventDefault();
                    callback?.();
                    setSearchState((prev) => ({
                        ...prev,
                        query: params.query !== undefined ? params.query : null,
                        ask: params.ask !== undefined ? params.ask : null,
                        global: params.global !== undefined ? params.global : false,
                        open: params.open !== undefined ? params.open : false,
                    }));
                },
            };
        },
        [setSearchState]
    );
}
