import React from 'react';

export function useSearchResultsCursor(props: {
    query: string;
    fetching: boolean;
    resultCount: number;
    totalCount: number;
}) {
    const [cursor, setCursor] = React.useState<number | null>(null);
    const { query, fetching, resultCount, totalCount } = props;

    React.useEffect(() => {
        if (!query) {
            // Reset the cursor when there's no query
            setCursor(null);
        }
    }, [query]);

    React.useEffect(() => {
        if (fetching && resultCount === 0) {
            // Nothing is highlighted while results load, so Enter can't open the Ask row instead.
            setCursor(null);
            return;
        }

        if (totalCount === 0) {
            return;
        }

        setCursor((prev) => {
            if (resultCount > 0) {
                return 0;
            }

            return prev ?? 0;
        });
    }, [fetching, resultCount, totalCount]);

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
