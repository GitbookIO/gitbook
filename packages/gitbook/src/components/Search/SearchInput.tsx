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
    withAI: boolean;
    isOpen: boolean;
    className?: string;
    children?: React.ReactNode;
}

// Size classes for medium size button
const sizeClasses = ['text-sm', 'px-3.5', 'py-1.5', 'md:circular-corners:px-4'];

/**
 * Input to trigger search.
 */
export const SearchInput = React.forwardRef<HTMLDivElement, SearchInputProps>(
    function SearchInput(props, ref) {
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
        const buttonStyles = useClassnames(['ButtonStyles']);

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
            <div className={tcls('relative flex size-9 grow', className)}>
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
                        'has-[input:focus]:-translate-y-px h-9 grow cursor-pointer px-2.5 has-[input:focus]:bg-tint-base has-[input:focus]:depth-subtle:shadow-lg has-[input:focus]:depth-subtle:shadow-primary-subtle has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-primary-hover md:cursor-text',
                        'theme-bold:border-header-link/3 has-[input:focus-visible]:theme-bold:border-header-link/5 has-[input:focus-visible]:theme-bold:bg-header-link/3 has-[input:focus-visible]:theme-bold:ring-header-link/5',
                        'theme-bold:before:absolute theme-bold:before:inset-0 theme-bold:before:bg-header-background/7 theme-bold:before:backdrop-blur-xl ', // Special overlay to make the transparent colors of theme-bold visible.
                        'relative z-30 max-w-none shrink grow justify-start max-md:absolute max-md:right-0',
                        isOpen ? 'max-md:w-56' : 'max-md:w-[38px]'
                    )}
                >
                    {value && isOpen ? (
                        <Button
                            variant="blank"
                            label="Clear"
                            size="medium"
                            iconOnly
                            icon="circle-xmark"
                            className="-ml-1.5 -mr-1 animate-scale-in px-1.5"
                            onClick={() => {
                                onChange('');
                                inputRef.current?.focus();
                            }}
                        />
                    ) : (
                        <Icon
                            icon="magnifying-glass"
                            className="size-4 shrink-0 animate-scale-in"
                        />
                    )}
                    {children}
                    <input
                        {...rest}
                        type="text"
                        onFocus={onFocus}
                        onKeyDown={onKeyDown}
                        onChange={(event) => onChange(event.target.value)}
                        value={value}
                        // We only show "search or ask" if the search input actually handles both search and ask.
                        placeholder={`${tString(language, withAI ? 'search_or_ask' : 'search')}…`}
                        maxLength={512}
                        size={10}
                        data-testid="search-input"
                        className={tcls(
                            'peer z-10 min-w-0 grow bg-transparent py-0.5 text-tint-strong theme-bold:text-header-link outline-hidden transition-[width] duration-300 contain-paint placeholder:text-tint theme-bold:placeholder:text-current theme-bold:placeholder:opacity-7',
                            isOpen ? '' : 'max-md:opacity-0'
                        )}
                        role="combobox"
                        autoComplete="off"
                        aria-autocomplete="list"
                        aria-haspopup="listbox"
                        aria-expanded={value && isOpen ? 'true' : 'false'}
                        // Forward
                        ref={inputRef}
                    />
                    {!isOpen ? <Shortcut /> : null}
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
                `shortcut -mr-1 relative z-10 hidden justify-end gap-0.5 whitespace-nowrap text-xs [font-feature-settings:"calt","case"] after:absolute after:right-full after:z-20 after:h-full after:w-8 after:bg-linear-to-r after:from-transparent after:to-tint-base theme-bold:after:to-transparent after:content-[''] contrast-more:text-tint-strong md:flex`,
                operatingSystem
                    ? 'motion-safe:animate-fade-in motion-reduce:opacity-11'
                    : 'opacity-0'
            )}
        >
            <kbd
                className={`flex h-5 min-w-5 items-center justify-center rounded-sm border border-tint-subtle theme-bold:border-header-link/5 bg-tint-base theme-bold:bg-header-background px-1 ${operatingSystem === 'mac' ? 'text-sm' : ''}`}
            >
                {operatingSystem === 'mac' ? '⌘' : 'Ctrl'}
            </kbd>
            <kbd className="flex size-5 items-center justify-center rounded-sm border border-tint-subtle theme-bold:border-header-link/5 bg-tint-base theme-bold:bg-header-background px-1">
                K
            </kbd>
        </div>
    );
}
