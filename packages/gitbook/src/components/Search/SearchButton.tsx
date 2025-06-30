'use client';

import { Icon } from '@gitbook/icons';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { useHotkeys } from 'react-hotkeys-hook';

interface SearchButtonProps {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    onFocus: () => void;
    onBlur: () => void;
    value: string;
    withAsk?: boolean;
}

/**
 * Button to open the search modal.
 */
export function SearchButton(props: SearchButtonProps) {
    const { onChange, onKeyDown, onFocus, onBlur, value, withAsk = false } = props;

    const language = useLanguage();

    const inputRef = useRef<HTMLInputElement>(null);

    const [isOpen, setIsOpen] = useState(false);

    const handleFocus = () => {
        onFocus();
        setIsOpen(true);
    };

    const handleBlur = () => {
        onBlur();
        setIsOpen(false);
    };

    useEffect(() => {
        if (isOpen === true) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    useHotkeys(
        'mod+k',
        (e) => {
            e.preventDefault();
            handleFocus();
        },
        []
    );

    return (
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div
            onClick={handleFocus}
            className="depth-subtle:hover:-translate-y-px depth-subtle:has-[:focus]:-translate-y-px relative flex h-9 grow items-center rounded-corners:rounded-md bg-tint-base px-3 shadow-sm shadow-tint ring-1 ring-tint transition-all hover:shadow-md hover:shadow-tint-subtle has-[:focus]:ring-2 has-[:focus]:ring-primary-hover"
        >
            <Icon
                icon="magnifying-glass"
                className="size-4 text-tint-subtle peer-focus:text-red-500"
            />
            <input
                type="text"
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={onKeyDown}
                onChange={onChange}
                value={value}
                placeholder={`${tString(language, withAsk ? 'search_or_ask' : 'search')}...`}
                className={tcls(
                    'peer grow bg-transparent py-2 text-tint-strong outline-none transition-all duration-500 placeholder:text-tint/9 md:transition-colors',
                    isOpen ? 'max-w-[32rem] px-3' : 'max-w-0 md:block md:max-w-[32rem] md:px-3'
                )}
                ref={inputRef}
            />
            <Shortcut />
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
