'use client';

import { tcls } from '@/lib/tailwind';
import React from 'react';
import Moon from '@geist-ui/icons/moon';
import Sun from '@geist-ui/icons/sun';
import Monitor from '@geist-ui/icons/monitor';

type ThemeMode = 'light' | 'system' | 'dark';

const LOCALSTORAGE_KEY = 'color-theme';

/**
 * Buttons to toggle between light/system/dark modes.
 */
export function ThemeToggler(props: {}) {
    const [mode, setMode] = React.useState<ThemeMode>('system');

    const onSwitchMode = (to: ThemeMode) => {
        setMode(to);
        window.localStorage.setItem(LOCALSTORAGE_KEY, to);
    };

    React.useEffect(() => {
        const value = window.localStorage.getItem(LOCALSTORAGE_KEY);
        if (value) {
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
                'rounded',
                'border',
                'border-slate-200',
                'dark:border-slate-800',
            )}
        >
            <ThemeButton
                active={mode === 'light'}
                icon={Sun}
                onClick={() => onSwitchMode('light')}
                title="Switch to light theme"
            />
            <ThemeButton
                active={mode === 'system'}
                icon={Monitor}
                onClick={() => onSwitchMode('system')}
                title="Switch to system theme"
            />
            <ThemeButton
                active={mode === 'dark'}
                icon={Moon}
                onClick={() => onSwitchMode('dark')}
                title="Switch to dark theme"
            />
        </div>
    );
}

function ThemeButton(props: {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
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
                'rounded',
                active ? ['bg-slate-200', 'dark:bg-slate-800'] : null,
                'text-slate-900',
                'dark:text-slate-400',
            )}
        >
            <Icon className={tcls('w-4', 'h-4')} />
        </button>
    );
}
