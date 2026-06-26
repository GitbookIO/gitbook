'use client';

import { tcls } from '@/lib/tailwind';
import React from 'react';

import { SearchInput } from './SearchInput';
import { SearchLiveResultsAnnouncer } from './SearchLiveResultsAnnouncer';

export interface SearchHeaderInputProps {
    activeDescendant?: string;
    controls?: string;
    className?: string;
    fetching?: boolean;
    interactive?: boolean;
    isOpen?: boolean;
    onChange?: (value: string) => void;
    onFocus?: () => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    resultsCount?: number;
    showAsk?: boolean;
    value?: string;
    withAI?: boolean;
}

const noop = () => {};

/**
 * Header search input visual used by the live site and structure preview.
 */
export const SearchHeaderInput = React.forwardRef<HTMLDivElement, SearchHeaderInputProps>(
    function SearchHeaderInput(props, ref) {
        const {
            activeDescendant,
            controls,
            className,
            fetching = false,
            interactive = true,
            isOpen = false,
            onChange = noop,
            onFocus,
            onKeyDown,
            resultsCount = 0,
            showAsk = false,
            value = '',
            withAI = false,
        } = props;

        return (
            <SearchInput
                ref={ref}
                aria-activedescendant={activeDescendant}
                aria-controls={controls}
                onChange={interactive ? onChange : noop}
                onKeyDown={interactive && onKeyDown ? onKeyDown : noop}
                value={value}
                withAI={withAI}
                isOpen={interactive && isOpen}
                className={tcls(className, !interactive ? 'pointer-events-none select-none' : null)}
                onFocus={interactive ? onFocus : undefined}
                resultsCount={resultsCount}
                fetching={fetching}
                showAsk={showAsk}
                readOnly={!interactive}
                tabIndex={interactive ? undefined : -1}
            >
                {interactive ? (
                    <SearchLiveResultsAnnouncer
                        count={resultsCount}
                        showing={Boolean(value) && !fetching}
                    />
                ) : null}
            </SearchInput>
        );
    }
);
