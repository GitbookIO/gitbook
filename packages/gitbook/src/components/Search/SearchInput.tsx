'use client';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { Button } from '../primitives';

interface SearchButtonProps {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    onFocus: () => void;
    value?: string;
    withAsk?: boolean;
    isOpen: boolean;
}

/**
 * Input to trigger search.
 */
export function SearchInput(props: SearchButtonProps) {
    const { onChange, onKeyDown, onFocus, value, withAsk = false, isOpen } = props;

    const language = useLanguage();

    const inputRef = useRef<HTMLInputElement>(null);

    // useEffect(() => {
    //     if (value) {
    //         inputRef.current?.focus();
    //         onFocus();
    //     }
    // }, [value, onFocus]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        } else {
            inputRef.current?.blur();
        }
    }, [isOpen]);

    return (
        <Button
            onClick={onFocus}
            className="has-[input:focus]:-translate-y-px grow bg-tint-base theme-gradient:bg-tint-base theme-muted:bg-tint-base depth-subtle:has-[input:focus]:shadow-md has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-primary-hover"
            icon="magnifying-glass"
            size="medium"
            variant="secondary"
            tabIndex={-1}
        >
            <input
                type="text"
                onFocus={onFocus}
                onKeyDown={onKeyDown}
                onChange={onChange}
                value={value ?? ''}
                placeholder={`${tString(language, withAsk ? 'search_or_ask' : 'search')}...`}
                className={tcls(
                    'peer grow cursor-pointer bg-transparent py-0.5 text-tint-strong outline-none transition-all duration-500 placeholder:text-tint/9 md:transition-colors',
                    value !== undefined ? 'max-w-[32rem]' : 'max-w-0 md:block md:max-w-[32rem]'
                )}
                ref={inputRef}
            />
            <Shortcut />
        </Button>
    );
}

function Shortcut() {
    const [operatingSystem, setOperatingSystem] = useState<string | null>(null);

    useEffect(() => {
        function getOperatingSystem() {
            const platform = navigator.platform.toLowerCase();

            if (platform.includes('mac')) return 'mac';
            if (platform.includes('win')) return 'win';

            return 'win';
        }

        setOperatingSystem(getOperatingSystem());
    }, []);

    return (
        <div
            aria-busy={operatingSystem === null ? 'true' : undefined}
            className={tcls(
                `shortcut -mr-1 hidden justify-end gap-0.5 whitespace-nowrap text-tint text-xs [font-feature-settings:"calt",_"case"] contrast-more:text-tint-strong md:flex`,
                operatingSystem
                    ? 'motion-safe:animate-fadeIn motion-reduce:opacity-100'
                    : 'opacity-0'
            )}
        >
            <kbd
                className={`flex h-5 min-w-5 items-center justify-center rounded border border-tint-subtle theme-bold:border-header-link/5 bg-tint-base theme-bold:bg-header-background px-1 ${operatingSystem === 'mac' ? 'text-sm' : ''}`}
            >
                {operatingSystem === 'mac' ? '⌘' : 'Ctrl'}
            </kbd>
            <kbd className="flex size-5 items-center justify-center rounded border border-tint-subtle theme-bold:border-header-link/5 bg-tint-base theme-bold:bg-header-background">
                K
            </kbd>
        </div>
    );
}
