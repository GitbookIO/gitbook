'use client';

import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React from 'react';
import type { LinkProps } from '../primitives';

/** How "wide" to search on the site. Determines section scope. */
export type SearchScope =
    /** Search all available sections */
    | 'all'
    /** Search only the current section */
    | 'current';

/** How "deep" to search within the scope. This determines the variant scope within sections. */
export type SearchDepth =
    /** Search only a single variant — either the current variant or default variant */
    | 'single'
    /** Search all variants within the scope */
    | 'full';

export interface SearchState {
    // URL-backed state
    query: string | null;
    ask: string | null;
    scope: SearchScope;
    depth: SearchDepth;

    // Local UI state
    open: boolean;
}

// KeyMap needs to be statically defined to avoid `setRawState` being redefined on every render.
const keyMap = {
    q: parseAsString,
    ask: parseAsString,
    scope: parseAsStringLiteral(['current', 'all']).withDefault('all'),
    depth: parseAsStringLiteral(['single', 'full']).withDefault('single'),
};

export type UpdateSearchState = (
    update: React.SetStateAction<SearchState | null>
) => Promise<URLSearchParams>;

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
            scope: rawState.scope,
            depth: rawState.depth,
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
                return setRawState({ q: null, ask: null, scope: 'all', depth: 'single' });
            }

            setIsOpen(update.open);
            return setRawState({
                q: update.query,
                ask: update.ask,
                scope: update.scope,
                depth: update.depth,
            });
        },
        [setRawState]
    );

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
            params.scope
                ? searchParams.set('sections', params.scope)
                : searchParams.delete('scope');
            params.depth
                ? searchParams.set('variants', params.depth)
                : searchParams.delete('depth');
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
                        scope: params.scope !== undefined ? params.scope : 'all',
                        depth: params.depth !== undefined ? params.depth : 'single',
                        open: params.open !== undefined ? params.open : false,
                    }));
                },
            };
        },
        [setSearchState]
    );
}
