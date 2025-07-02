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
    className?: string;
}

/**
 * Input to trigger search.
 */
export function SearchInput(props: SearchButtonProps) {
    const { onChange, onKeyDown, onFocus, value, withAsk = false, isOpen, className } = props;

    const language = useLanguage();

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            if (value) {
                // Place cursor at the end of the input
                inputRef.current?.setSelectionRange(value.length, value.length);
            }
        } else {
            inputRef.current?.blur();
        }
    }, [isOpen]);

    return (
        <div className="relative flex size-9 grow">
            <Button
                onClick={onFocus}
                className={tcls(
                    'has-[input:focus]:-translate-y-px h-9 grow px-3 hover:text-tint-strong has-[input:focus]:bg-tint-base depth-subtle:has-[input:focus]:shadow-lg depth-subtle:has-[input:focus]:shadow-primary-subtle has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-primary-hover',
                    'theme-bold:has-[input:focus-visible]:bg-header-link/3 theme-bold:has-[input:focus-visible]:ring-header-link/6',
                    'z-30 max-md:absolute max-md:right-0',
                    className
                )}
                icon="magnifying-glass"
                size="medium"
                variant="header"
                tabIndex={-1}
            >
                <input
                    type="text"
                    onFocus={onFocus}
                    onKeyDown={onKeyDown}
                    onChange={onChange}
                    value={value ?? ''}
                    size={1} // Determines the width of the input (in characters). It's inconsistent between browsers and limits the min-width, so we set it to a sensible minimum and control width ourselves.
                    placeholder={`${tString(language, withAsk ? 'search_or_ask' : 'search')}...`}
                    className={tcls(
                        'peer grow cursor-pointer bg-transparent py-0.5 outline-none transition-all duration-300 placeholder:text-tint theme-bold:placeholder:text-current theme-bold:placeholder:opacity-7',
                        value !== undefined ? 'w-40' : 'max-md:-ml-2 max-md:w-0 max-md:opacity-0'
                    )}
                    ref={inputRef}
                />
                <Shortcut />
            </Button>
        </div>
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
                `shortcut -mr-1 hidden justify-end gap-0.5 whitespace-nowrap text-xs [font-feature-settings:"calt",_"case"] contrast-more:text-tint-strong md:flex`,
                operatingSystem
                    ? 'motion-safe:animate-fadeIn motion-reduce:opacity-11'
                    : 'opacity-0'
            )}
        >
            <kbd
                className={`flex h-5 min-w-5 items-center justify-center rounded border border-tint-subtle theme-bold:border-header-link/5 bg-tint-base theme-bold:bg-header-background px-1 ${operatingSystem === 'mac' ? 'text-sm' : ''}`}
            >
                {operatingSystem === 'mac' ? '⌘' : 'Ctrl'}
            </kbd>
            <kbd className="flex size-5 items-center justify-center rounded border border-tint-subtle theme-bold:border-header-link/5 bg-tint-base theme-bold:bg-header-background px-1">
                K
            </kbd>
        </div>
    );
}
