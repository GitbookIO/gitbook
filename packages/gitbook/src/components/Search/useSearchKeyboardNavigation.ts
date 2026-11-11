import React from 'react';

import type { SearchResultsRef } from './SearchResults';
import type { ResultType, SearchPhase } from './useSearchResults';

/** The row highlighted when none was picked with the arrow keys. */
function getDefaultCursor(phase: SearchPhase, rowCount: number): number | null {
    // Results listed while loading are provisional, so none of them is the default.
    return phase === 'loading' || rowCount === 0 ? null : 0;
}

type EnterAction =
    | { type: 'wait' }
    | { type: 'open' }
    | { type: 'ask'; assistantIndex: number }
    | { type: 'none' };

/** What Enter does, given the highlighted row. */
function getEnterAction(input: {
    phase: SearchPhase;
    cursor: number | null;
    resultCount: number;
    listMounted: boolean;
}): EnterAction {
    const { phase, cursor, resultCount, listMounted } = input;

    if (cursor === null) {
        return phase === 'loading' ? { type: 'wait' } : { type: 'none' };
    }
    if (cursor >= resultCount) {
        return { type: 'ask', assistantIndex: cursor - resultCount };
    }
    // The results list is loaded on demand and can mount after the results arrive.
    return listMounted ? { type: 'open' } : { type: 'wait' };
}

/**
 * Keyboard navigation of the search rows (results, then one "ask" row per assistant):
 * which row is highlighted and what Enter does.
 */
export function useSearchKeyboardNavigation(props: {
    /** Identifies the search; changes with the input value, the scope and the section. */
    searchKey: string;
    open: boolean;
    phase: SearchPhase;
    results: ResultType[];
    askCount: number;
    onAskSelect: (assistantIndex: number) => void;
}) {
    const { searchKey, open, phase, results, askCount, onAskSelect } = props;
    const rowCount = results.length + askCount;

    const resultsListRef = React.useRef<SearchResultsRef | null>(null);
    const [listMounted, setListMounted] = React.useState(false);
    const setResultsList = React.useCallback((list: SearchResultsRef | null) => {
        resultsListRef.current = list;
        setListMounted(list !== null);
    }, []);

    // A pick only holds for the list it was made on.
    const [picked, setPicked] = React.useState<{ results: ResultType[]; index: number } | null>(
        null
    );
    let cursor = getDefaultCursor(phase, rowCount);
    if (picked?.results === results && rowCount > 0) {
        cursor = Math.min(picked.index, rowCount - 1);
    }

    const moveCursorBy = React.useCallback(
        (delta: number) => {
            if (rowCount === 0) {
                return;
            }
            const index = cursor === null ? 0 : Math.max(Math.min(cursor + delta, rowCount - 1), 0);
            setPicked({ results, index });
        },
        [cursor, results, rowCount]
    );

    // The search Enter was pressed on while it could not act yet.
    const [waitingFor, setWaitingFor] = React.useState<string | null>(null);

    const pressEnter = React.useCallback(() => {
        const action = getEnterAction({
            phase,
            cursor,
            resultCount: results.length,
            listMounted,
        });
        setWaitingFor(action.type === 'wait' ? searchKey : null);

        if (action.type === 'open') {
            resultsListRef.current?.select();
        } else if (action.type === 'ask') {
            onAskSelect(action.assistantIndex);
        }
    }, [phase, cursor, results.length, listMounted, searchKey, onAskSelect]);

    React.useEffect(() => {
        if (waitingFor === null) {
            return;
        }
        // Dropped when the search changed, the box closed, or the visitor opened a result
        // or asked an assistant before the server answered.
        if (waitingFor !== searchKey || !open || phase === 'stopped') {
            setWaitingFor(null);
            return;
        }
        pressEnter();
    }, [waitingFor, searchKey, open, phase, pressEnter]);

    const onInputKeyDown = React.useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                event.preventDefault();
                setWaitingFor(null);
                moveCursorBy(event.key === 'ArrowUp' ? -1 : 1);
            } else if (event.key === 'Escape') {
                setWaitingFor(null);
            } else if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                event.preventDefault();
                pressEnter();
            }
        },
        [moveCursorBy, pressEnter]
    );

    return {
        cursor,
        onInputKeyDown,
        enterWaiting: waitingFor !== null,
        resultsRef: setResultsList,
    };
}
