'use client';
import React, { useEffect, useRef } from 'react';

import { t, tString, useLanguage } from '@/intl/client';
import { Icon } from '@gitbook/icons';
import { AISearchIcon } from '../AIChat';
import { Input } from '../primitives';

interface SearchInputProps {
    'aria-activedescendant'?: string;
    'aria-controls'?: string;
    onChange: (value: string) => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    onFocus?: () => void;
    value: string;
    withAI: boolean;
    isOpen: boolean;
    className?: string;
    children?: React.ReactNode;
    mode?: 'header' | 'frame';
    resultsCount: number;
    fetching: boolean;
    showAsk: boolean;
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
            mode = 'header',
            resultsCount,
            fetching,
            showAsk,
            ...rest
        } = props;
        const inputRef = useRef<HTMLInputElement>(null);
        const isFrame = mode === 'frame';

        const language = useLanguage();

        useEffect(() => {
            if (!isOpen) {
                inputRef.current?.blur();
                return;
            }

            const focusInput = () => {
                if (document.activeElement !== inputRef.current) {
                    inputRef.current?.focus({ preventScroll: true });
                    inputRef.current?.setSelectionRange(value.length, value.length);
                }
            };

            if (!isFrame) {
                focusInput();
                return;
            }

            const timeout = window.setTimeout(focusInput, 150);
            return () => window.clearTimeout(timeout);
        }, [isFrame, isOpen, value.length]);

        return (
            <div
                className={
                    isFrame ? 'relative flex w-full grow' : 'relative flex @max-2xl:size-9.5 grow'
                }
            >
                <Input
                    data-testid="search-input"
                    name="search-input"
                    ref={inputRef}
                    containerRef={containerRef as React.RefObject<HTMLDivElement | null>}
                    sizing="medium"
                    label={tString(language, withAI ? 'search_or_ask' : 'search')}
                    className={
                        isFrame
                            ? 'grow bg-tint-base [&_input]:text-sm'
                            : '@max-2xl:absolute inset-y-0 right-0 z-30 @max-2xl:max-w-9.5 grow site-header:theme-bold:border-header-link/4 site-header:theme-bold:bg-header-link/1 @max-2xl:px-2.5 site-header:theme-bold:text-header-link site-header:theme-bold:shadow-none! site-header:theme-bold:backdrop-blur-xl @max-2xl:focus-within:w-56 @max-2xl:focus-within:max-w-[calc(100vw-5rem)] site-header:theme-bold:focus-within:border-header-link/6 site-header:theme-bold:focus-within:ring-header-link/5 site-header:theme-bold:hover:border-header-link/5 site-header:theme-bold:hover:not-focus-within:bg-header-link/2 @max-2xl:has-[input[aria-expanded=true]]:w-56 @max-2xl:has-[input[aria-expanded=true]]:max-w-[calc(100vw-5rem)] @max-2xl:[&_input]:opacity-0 site-header:theme-bold:[&_input]:placeholder:text-header-link/8 @max-2xl:focus-within:[&_input]:opacity-11 @max-2xl:has-[input[aria-expanded=true]]:[&_input]:opacity-11'
                    }
                    placeholder={`${tString(language, withAI ? 'search_or_ask' : 'search')}…`}
                    onFocus={onFocus}
                    onKeyDown={onKeyDown}
                    leading={
                        showAsk ? (
                            <AISearchIcon />
                        ) : (
                            <Icon
                                icon="search"
                                className={
                                    isFrame
                                        ? 'size-text-lg shrink-0 text-tint-subtle'
                                        : 'size-text-lg shrink-0 site-header:theme-bold:text-header-link/8 text-tint'
                                }
                            />
                        )
                    }
                    onValueChange={onChange}
                    value={value}
                    maxLength={512}
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-haspopup="listbox"
                    aria-expanded={value && isOpen ? 'true' : 'false'}
                    clearButton={
                        isFrame
                            ? true
                            : {
                                  className:
                                      'site-header:theme-bold:text-header-link site-header:theme-bold:hover:bg-header-link/3',
                              }
                    }
                    trailing={
                        !showAsk && value && resultsCount > 0 ? (
                            <div className="mr-2 animate-blur-in text-sm text-tint-subtle">
                                {t(language, 'search_results_count', resultsCount.toString())}
                            </div>
                        ) : undefined
                    }
                    keyboardShortcut={
                        !value && !isFrame && !isOpen
                            ? {
                                  keys: ['mod', 'k'],
                                  className:
                                      'bg-tint-base site-header:theme-bold:border-header-link/4 site-header:theme-bold:bg-header-background site-header:theme-bold:text-header-link',
                              }
                            : undefined
                    }
                    {...rest}
                    type="text"
                />
                {children}
            </div>
        );
    }
);
