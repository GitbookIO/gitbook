import React from 'react';
import type { ResultType } from './useSearchResults';

export function useSearchResultsCursor(props: { query: string; results: ResultType[] }) {
    const [cursor, setCursor] = React.useState<number | null>(null);
    const { query, results } = props;

    React.useEffect(() => {
        if (!query) {
            // Reset the cursor when there's no query
            setCursor(null);
        }
    }, [query]);

    React.useEffect(() => {
        if (results.length > 0) {
            // Auto-focus the first result
            setCursor(0);
        }
    }, [results]);

    const moveBy = React.useCallback(
        (delta: number) => {
            setCursor((prev) => {
                if (prev === null) {
                    return 0;
                }
                return Math.max(Math.min(prev + delta, results.length - 1), 0);
            });
        },
        [results]
    );

    return {
        cursor,
        setCursor,
        moveBy,
    };
}
