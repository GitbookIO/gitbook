'use client';

import Monitor from '@geist-ui/icons/monitor';
import Moon from '@geist-ui/icons/moon';
import Sun from '@geist-ui/icons/sun';
import React from 'react';

import { IconComponent } from '@/components/icons';
import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

type ThemeMode = 'light' | 'system' | 'dark';

const LOCALSTORAGE_KEY = 'color-theme';

/**
 * Buttons to toggle between light/system/dark modes.
 */
export function ThemeToggler(props: {}) {
    const [mode, setMode] = React.useState<ThemeMode>('system');

    const language = useLanguage();

    const onSwitchMode = (to: ThemeMode) => {
        setMode(to);
        window.localStorage.setItem(LOCALSTORAGE_KEY, to);
    };

    React.useEffect(() => {
        const value = window.localStorage.getItem(LOCALSTORAGE_KEY);
        if (value && (value === 'light' || value === 'system' || value === 'dark')) {
            setMode(value);
        }
    }, []);

    React.useEffect(() => {
        const applied =
            mode === 'system'
                ? window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light'
                : mode;

        if (applied === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
        }
    }, [mode]);

    return (
        <div
            role="radiogroup"
            className={tcls(
                'flex',
                'flex-row',
                'rounded-full',
                'border',
                'border-dark/3',
                'dark:border-light/2',
            )}
        >
            <ThemeButton
                active={mode === 'light'}
                icon={Sun}
                onClick={() => onSwitchMode('light')}
                title={tString(language, 'switch_to_light_theme')}
            />
            <ThemeButton
                active={mode === 'system'}
                icon={Monitor}
                onClick={() => onSwitchMode('system')}
                title={tString(language, 'switch_to_system_theme')}
            />
            <ThemeButton
                active={mode === 'dark'}
                icon={Moon}
                onClick={() => onSwitchMode('dark')}
                title={tString(language, 'switch_to_dark_theme')}
            />
        </div>
    );
}

function ThemeButton(props: {
    icon: IconComponent;
    onClick: () => void;
    title: string;
    active: boolean;
}) {
    const { icon: Icon, onClick, title, active } = props;
    return (
        <button
            type="button"
            role="radio"
            onClick={onClick}
            aria-label={title}
            aria-checked={active}
            className={tcls(
                'p-1',
                'm-1',
                'group',
                'rounded-full',
                active ? ['bg-primary-600/4', 'dark:bg-primary-400/2'] : null,
                'text-dark',
                'dark:text-light/7',
            )}
        >
            <Icon
                className={tcls(
                    'w-4',
                    'h-4',
                    active ? ['stroke-primary-600', 'dark:stroke-primary-400'] : null,
                )}
            />
        </button>
    );
}
