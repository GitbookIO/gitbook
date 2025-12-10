'use client';
import React, { useEffect, useRef } from 'react';

import { tString, useLanguage } from '@/intl/client';
import { Input } from '../primitives/Input';
import { KeyboardShortcut } from '../primitives/KeyboardShortcut';

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
            <Input
                data-testid="search-input"
                name="search-input"
                ref={inputRef}
                containerRef={containerRef as React.RefObject<HTMLDivElement | null>}
                sizing="small"
                label={tString(language, withAI ? 'search_or_ask' : 'search')}
                className="grow"
                placeholder={`${tString(language, withAI ? 'search_or_ask' : 'search')}…`}
                onFocus={onFocus}
                onKeyDown={onKeyDown}
                leading="magnifying-glass"
                onChange={(event) => {
                    onChange(event.target.value);
                }}
                value={value}
                maxLength={512}
                autoComplete="off"
                aria-autocomplete="list"
                aria-haspopup="listbox"
                aria-expanded={value && isOpen ? 'true' : 'false'}
                clearButton
                keyboardShortcut={<KeyboardShortcut keys={isOpen ? ['esc'] : ['mod', 'k']} />}
                {...rest}
                type="text"
            />
        );
    }
);
