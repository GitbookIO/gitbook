import React from 'react';

export function useSearchResultsCursor(props: {
    query: string;
    resultCount: number;
    totalCount: number;
}) {
    const [cursor, setCursor] = React.useState<number | null>(null);
    const { query, resultCount, totalCount } = props;

    React.useEffect(() => {
        if (!query) {
            // Reset the cursor when there's no query
            setCursor(null);
        }
    }, [query]);

    React.useEffect(() => {
        if (resultCount > 0) {
            // Auto-focus the first result
            setCursor(0);
        }
    }, [resultCount]);

    React.useEffect(() => {
        setCursor((prev) => {
            if (prev === null) {
                return prev;
            }

            if (totalCount === 0) {
                return null;
            }

            return Math.min(prev, totalCount - 1);
        });
    }, [totalCount]);

    const moveBy = React.useCallback(
        (delta: number) => {
            setCursor((prev) => {
                if (totalCount === 0) {
                    return null;
                }

                if (prev === null) {
                    return 0;
                }

                return Math.max(Math.min(prev + delta, totalCount - 1), 0);
            });
        },
        [totalCount]
    );

    return {
        cursor,
        setCursor,
        moveBy,
    };
}
