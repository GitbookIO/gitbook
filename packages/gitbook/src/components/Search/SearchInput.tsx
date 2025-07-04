'use client';
import React from 'react';
import { useEffect, useRef, useState } from 'react';

import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { Icon } from '@gitbook/icons';
import { Button, variantClasses } from '../primitives';
import { useClassnames } from '../primitives/StyleProvider';

interface SearchInputProps {
    onChange: (value: string) => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    onFocus: () => void;
    value: string;
    withAI?: boolean;
    isOpen: boolean;
    className?: string;
}

// Size classes for medium size button
const sizeClasses = ['text-sm', 'px-3.5', 'py-1.5', 'circular-corners:px-4'];

/**
 * Input to trigger search.
 */
export const SearchInput = React.forwardRef<HTMLDivElement, SearchInputProps>(
    function SearchInput(props, ref) {
        const { onChange, onKeyDown, onFocus, value, withAI = false, isOpen, className } = props;
        const inputRef = useRef<HTMLInputElement>(null);

        const language = useLanguage();
        const buttonStyles = useClassnames(['ButtonStyles']);

        useEffect(() => {
            if (isOpen) {
                inputRef.current?.focus();
                // Place cursor at the end of the input
                inputRef.current?.setSelectionRange(value.length, value.length);
            } else {
                inputRef.current?.blur();
            }
        }, [isOpen]);

        return (
            <div className="relative flex size-9 grow">
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: this div needs an onClick to show the input on mobile, where it's normally hidden.
                Normally you'd also need to add a keyboard trigger to do the same without a pointer, but in this case the input already be focused on its own. */}
                <div
                    ref={ref}
                    onClick={onFocus}
                    className={tcls(
                        // Apply button styles
                        buttonStyles,
                        variantClasses.header,
                        sizeClasses,
                        // Additional custom styles
                        'has-[input:focus]:-translate-y-px h-9 grow cursor-pointer px-2.5 has-[input:focus]:bg-tint-base depth-subtle:has-[input:focus]:shadow-lg depth-subtle:has-[input:focus]:shadow-primary-subtle has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-primary-hover md:cursor-text',
                        'theme-bold:has-[input:focus-visible]:bg-header-link/3 theme-bold:has-[input:focus-visible]:ring-header-link/6',
                        'theme-bold:before:absolute theme-bold:before:inset-0 theme-bold:before:bg-header-background/7 theme-bold:before:backdrop-blur-xl ', // Special overlay to make the transparent colors of theme-bold visible.
                        'relative z-30 max-md:absolute max-md:right-0',
                        className
                    )}
                >
                    {value ? (
                        <Button
                            variant="blank"
                            label="Clear"
                            size="medium"
                            iconOnly
                            icon="circle-xmark"
                            className="-mx-1.5 animate-scaleIn px-1.5 theme-bold:text-header-link theme-bold:hover:bg-header-link/3"
                            onClick={() => {
                                onChange('');
                                inputRef.current?.focus();
                            }}
                        />
                    ) : (
                        <Icon icon="magnifying-glass" className="size-4 animate-scaleIn" />
                    )}

                    <input
                        type="text"
                        onFocus={onFocus}
                        onKeyDown={onKeyDown}
                        onChange={(event) => onChange(event.target.value)}
                        value={value}
                        size={1} // Determines the width of the input (in characters). It's inconsistent between browsers and overrides the min-width in some cases, so we set it to a minimum and control width ourselves. See https://stackoverflow.com/a/29990524
                        placeholder={`${tString(language, withAI ? 'search_or_ask' : 'search')}...`}
                        className={tcls(
                            'peer z-10 grow bg-transparent py-0.5 text-tint-strong theme-bold:text-header-link outline-none transition-[width] duration-300 placeholder:text-tint theme-bold:placeholder:text-current theme-bold:placeholder:opacity-7',
                            isOpen ? 'max-md:w-40' : 'max-md:-ml-2 max-md:w-0 max-md:opacity-0'
                        )}
                        ref={inputRef}
                    />
                    <Shortcut />
                </div>
            </div>
        );
    }
);

function getOperatingSystem() {
    const platform = navigator.platform.toLowerCase();

    if (platform.includes('mac')) return 'mac';
    if (platform.includes('win')) return 'win';

    return 'win';
}

function Shortcut() {
    const [operatingSystem, setOperatingSystem] = useState<string | null>(null);

    useEffect(() => {
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
