'use client';

import {
    type Values,
    parseAsBoolean,
    parseAsString,
    parseAsStringLiteral,
    useQueryStates,
} from 'nuqs';
import React from 'react';
import type { LinkProps } from '../primitives';

export type SearchScope =
    /** Search all content on the site */
    | 'all'
    /** Search the current section's variant + matched/default variant for other sections */
    | 'default'
    /** Search all variants of the current section */
    | 'extended'
    /** Search only the current section's current variant */
    | 'current';

export interface SearchState {
    // URL-backed state
    query: string | null;
    ask: string | null;
    scope: SearchScope;

    // Local UI state
    open: boolean;
}

// KeyMap needs to be statically defined to avoid `setRawState` being redefined on every render.
const keyMap = {
    q: parseAsString,
    ask: parseAsString,
    scope: parseAsStringLiteral(['all', 'default', 'extended', 'current']).withDefault('default'),
    global: parseAsBoolean, // Legacy support for global=true
};

export type UpdateSearchState = (
    update: React.SetStateAction<SearchState | null>
) => Promise<URLSearchParams>;

const SetSearchStateContext = React.createContext<UpdateSearchState | undefined>(undefined);
const SearchStateContext = React.createContext<SearchState | null | undefined>(undefined);

/**
 * Normalize the raw state to handle legacy formats.
 */
function normalizeRawState(values: Values<typeof keyMap>) {
    // Convert legacy format: q=query&ask=true -> ask=query&q=null
    if (values.ask === 'true' && values.q) {
        return { ...values, q: null, ask: values.q };
    }
    // Handle legacy global=true
    if (values.global === true) {
        return { ...values, scope: 'all' as const, global: null };
    }

    return values;
}

export function SearchContextProvider(props: React.PropsWithChildren): React.ReactElement {
    const { children } = props;

    // URL-backed state
    const [rawState, setRawState] = useQueryStates(keyMap, {
        history: 'replace',
    });

    // Local UI state for the popover open/close (not in URL)
    const [open, setIsOpen] = React.useState(() => normalizeRawState(rawState).q !== null);

    const state = React.useMemo<SearchState | null>(() => {
        const normalized = normalizeRawState(rawState);
        if (normalized.q === null && normalized.ask === null) {
            return null;
        }
        return {
            query: normalized.q,
            ask: normalized.ask,
            scope: normalized.scope,
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
                return setRawState({ q: null, ask: null, scope: 'default' });
            }

            setIsOpen(update.open);
            return setRawState({
                q: update.query,
                ask: update.ask,
                scope: update.scope,
            });
        },
        [setRawState]
    );

    return (
        <SearchStateContext.Provider value={state}>
            <SetSearchStateContext.Provider value={setState}>
                {children}
            </SetSearchStateContext.Provider>
        </SearchStateContext.Provider>
    );
}

export function useSetSearchState() {
    const setState = React.useContext(SetSearchStateContext);
    if (setState === undefined) {
        throw new Error('useSetSearchState must be used within SearchContextProvider');
    }
    return setState;
}

export function useSearchState() {
    const state = React.useContext(SearchStateContext);
    if (state === undefined) {
        throw new Error('useSearchState must be used within SearchContextProvider');
    }
    return state;
}

/**
 * Hook to create a link to a search query.
 */
export function useSearchLink(): (
    params: Partial<SearchState>,
    callback?: () => void
) => LinkProps {
    const setSearchState = useSetSearchState();

    return React.useCallback(
        (params, callback) => {
            const searchParams = new URLSearchParams();
            params.query ? searchParams.set('q', params.query) : searchParams.delete('q');
            params.ask ? searchParams.set('ask', params.ask) : searchParams.delete('ask');
            params.scope ? searchParams.set('scope', params.scope) : searchParams.delete('scope');
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
                        scope: params.scope !== undefined ? params.scope : 'default',
                        open: params.open !== undefined ? params.open : false,
                    }));
                },
            };
        },
        [setSearchState]
    );
}
