import React from 'react';

import { tcls } from '@/lib/tailwind';

import { OrderedComputedResult, searchContent } from './searchContent';
import { SearchPageResultItem } from './SearchPageResultItem';
import { SearchSectionResultItem } from './SearchSectionResultItem';

export interface SearchResultsRef {
    moveUp(): void;
    moveDown(): void;
    select(): void;
}

export const SearchResults = React.forwardRef(function SearchResults(
    props: {
        query: string;
        spaceId: string;
        noResultsMessage: string;
    },
    ref: React.Ref<SearchResultsRef>,
) {
    const { query, spaceId, noResultsMessage } = props;

    const debounceTimeout = React.useRef<NodeJS.Timeout | null>(null);
    const [results, setResults] = React.useState<OrderedComputedResult[] | null>(null);
    const [cursor, setCursor] = React.useState<number | null>(null);
    const refs = React.useRef<(null | HTMLAnchorElement)[]>([]);

    React.useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(async () => {
            setCursor(null);
            setResults(await searchContent(spaceId, query));
        }, 250);

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [query, spaceId]);

    // Scroll to the active result.
    React.useEffect(() => {
        if (cursor === null || !refs.current[cursor]) {
            return;
        }

        refs.current[cursor]?.scrollIntoView({
            block: 'nearest',
            inline: 'nearest',
        });
    }, [cursor, refs]);

    const moveBy = React.useCallback(
        (delta: number) => {
            if (!results) {
                return;
            }

            setCursor((prev) => {
                if (prev === null) {
                    return 0;
                }

                return Math.max(Math.min(prev + delta, results.length - 1), 0);
            });
        },
        [results],
    );

    const select = React.useCallback(() => {
        if (cursor === null || !refs.current[cursor]) {
            return;
        }

        refs.current[cursor]?.click();
    }, [cursor, refs]);

    React.useImperativeHandle(
        ref,
        () => ({
            moveUp: () => {
                moveBy(-1);
            },
            moveDown: () => {
                moveBy(1);
            },
            select,
        }),
        [moveBy, select],
    );

    if (!results) {
        return null;
    }

    return (
        <div className={tcls('max-h-[60vh]', 'overflow-auto', 'px')}>
            {results.length === 0 ? (
                <div className={tcls('text-sm', 'text-dark', 'p-6', 'text-center')}>
                    {noResultsMessage}
                </div>
            ) : (
                results.map((item, index) => {
                    return item.type === 'page' ? (
                        <SearchPageResultItem
                            ref={(ref) => {
                                refs.current[index] = ref;
                            }}
                            key={item.id}
                            query={query}
                            item={item}
                            active={index === cursor}
                        />
                    ) : (
                        <SearchSectionResultItem
                            ref={(ref) => {
                                refs.current[index] = ref;
                            }}
                            key={item.id}
                            query={query}
                            item={item}
                            active={index === cursor}
                        />
                    );
                })
            )}
        </div>
    );
});
