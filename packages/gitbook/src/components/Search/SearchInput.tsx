'use client';
import React, { useEffect, useRef } from 'react';

import { tString, useLanguage } from '@/intl/client';
import { Icon } from '@gitbook/icons';
import { Input } from '../primitives';

interface SearchInputProps {
    onChange: (value: string) => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    onFocus: () => void;
    value: string;
    withAI: boolean;
    isOpen: boolean;
    className?: string;
    children?: React.ReactNode;
}

/**
 * Input to trigger search.
 */
export const SearchInput = React.forwardRef<HTMLDivElement, SearchInputProps>(
    function SearchInput(props, containerRef) {
        const {
            onChange,
            onKeyDown,
            onFocus,
            value,
            withAI,
            isOpen,
            className,
            children,
            ...rest
        } = props;
        const inputRef = useRef<HTMLInputElement>(null);

        const language = useLanguage();

        useEffect(() => {
            if (isOpen) {
                if (document.activeElement !== inputRef.current) {
                    // Refocus the input and move the caret to the end – do this only once to avoid scroll jumps on every keystroke
                    inputRef.current?.focus({ preventScroll: true });
                    // Place cursor at the end of the input
                    inputRef.current?.setSelectionRange(value.length, value.length);
                }
            } else {
                inputRef.current?.blur();
            }
        }, [isOpen, value]);

        return (
            <div className="relative flex @max-2xl:size-9.5 grow">
                <Input
                    data-testid="search-input"
                    name="search-input"
                    ref={inputRef}
                    containerRef={containerRef as React.RefObject<HTMLDivElement | null>}
                    sizing="medium"
                    label={tString(language, withAI ? 'search_or_ask' : 'search')}
                    className="@max-2xl:absolute inset-y-0 right-0 z-30 @max-2xl:max-w-9.5 grow theme-bold:border-header-link/4 theme-bold:bg-header-background theme-bold:text-header-link theme-bold:shadow-none! @max-2xl:focus-within:w-56 @max-2xl:focus-within:max-w-[calc(100vw-5rem)] theme-bold:focus-within:border-header-link/6 theme-bold:focus-within:bg-header-link/1 theme-bold:focus-within:ring-header-link/5 theme-bold:hover:border-header-link/5 theme-bold:hover:bg-header-link/1 @max-2xl:has-[input[aria-expanded=true]]:w-56 @max-2xl:has-[input[aria-expanded=true]]:max-w-[calc(100vw-5rem)] @max-2xl:[&_input]:opacity-0 theme-bold:[&_input]:placeholder:text-header-link/8 @max-2xl:focus-within:[&_input]:opacity-11 @max-2xl:has-[input[aria-expanded=true]]:[&_input]:opacity-11"
                    placeholder={`${tString(language, withAI ? 'search_or_ask' : 'search')}…`}
                    onFocus={onFocus}
                    onKeyDown={onKeyDown}
                    leading={
                        <Icon
                            icon="search"
                            className="-ml-0.5 size-4 shrink-0 text-tint theme-bold:text-header-link/8"
                        />
                    }
                    onChange={(event) => {
                        onChange(event.target.value);
                    }}
                    value={value}
                    maxLength={512}
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-haspopup="listbox"
                    aria-expanded={value && isOpen ? 'true' : 'false'}
                    clearButton={{
                        className: 'theme-bold:hover:bg-header-link/4',
                    }}
                    keyboardShortcut={{
                        className:
                            'theme-bold:border-header-link/4 theme-bold:bg-header-background theme-bold:text-header-link',
                        keys: isOpen ? ['esc'] : ['mod', 'k'],
                    }}
                    {...rest}
                    type="text"
                />
            </div>
        );
    }
);
