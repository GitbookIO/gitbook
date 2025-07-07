import { parseAsBoolean, parseAsString, useQueryStates } from 'nuqs';
import React from 'react';

import type { LinkProps } from '../primitives';

export interface SearchState {
    query: string;
    ask: boolean;
    global: boolean;
    isOpen: boolean;
}

// KeyMap needs to be statically defined to avoid `setRawState` being redefined on every render.
const keyMap = {
    q: parseAsString,
    ask: parseAsBoolean,
    global: parseAsBoolean,
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

    // Separate local state for isOpen (not synchronized with URL)
    // Default to true if there's already a query in the URL
    const [isOpen, setIsOpen] = React.useState(() => {
        return rawState?.q !== null;
    });

    const state = React.useMemo<SearchState | null>(() => {
        if (rawState === null || rawState.q === null) {
            return null;
        }

        return {
            query: rawState.q,
            ask: !!rawState.ask,
            global: !!rawState.global,
            isOpen: isOpen,
        };
    }, [rawState, isOpen]);

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
            setIsOpen(update.isOpen);

            return setRawState({
                q: update.query,
                ask: update.ask ? true : null,
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
            searchParams.set('q', query.query ?? '');
            query.ask ? searchParams.set('ask', 'true') : searchParams.delete('ask');
            query.global ? searchParams.set('global', 'true') : searchParams.delete('global');
            return {
                href: `?${searchParams.toString()}`,
                prefetch: false,
                onClick: (event) => {
                    event.preventDefault();
                    setSearch((prev) => ({
                        query: '',
                        ask: false,
                        global: false,
                        isOpen: true,
                        ...(prev ?? {}),
                        ...query,
                    }));
                },
            };
        },
        [setSearch]
    );
}
