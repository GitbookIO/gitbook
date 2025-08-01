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

/**
 * Hook to access the current search query and update it.
 */
export function useSearch(withAIChat = false): [SearchState | null, UpdateSearchState] {
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

    // Separate local state for open (not synchronized with URL)
    // Default to true if there's already a query in the URL
    const [open, setIsOpen] = React.useState(() => {
        return rawState?.q !== null || (!withAIChat && rawState?.ask !== null);
    });

    const state = React.useMemo<SearchState | null>(() => {
        if (rawState === null || (rawState.q === null && rawState.ask === null)) {
            return null;
        }

        return {
            query: rawState.q,
            ask: rawState.ask,
            global: !!rawState.global,
            open: open,
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
                return setRawState({
                    q: null,
                    ask: null,
                    global: null,
                });
            }

            // Update the local state
            setIsOpen(update.open);

            return setRawState({
                q: update.query,
                ask: update.ask,
                global: update.global ? true : null,
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
            query.query ? searchParams.set('q', query.query) : searchParams.delete('q');
            query.ask ? searchParams.set('ask', query.ask) : searchParams.delete('ask');
            query.global ? searchParams.set('global', 'true') : searchParams.delete('global');
            return {
                href: `?${searchParams.toString()}`,
                prefetch: false,
                onClick: (event) => {
                    event.preventDefault();
                    setSearch((prev) => ({
                        query: null,
                        ask: null,
                        global: false,
                        open: query.open ?? prev?.open ?? false,
                        ...(prev ?? {}),
                        ...query,
                    }));
                },
            };
        },
        [setSearch]
    );
}
