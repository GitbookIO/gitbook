'use client';

import { Icon, IconName } from '@gitbook/icons';
import { useTheme } from 'next-themes';
import React from 'react';

import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

type ThemeMode = 'light' | 'system' | 'dark';

/**
 * Buttons to toggle between light/system/dark modes.
 */
export function ThemeToggler(props: {}) {
    const language = useLanguage();

    const [mounted, setMounted] = React.useState(false);
    const { theme, setTheme } = useTheme();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const onSwitchMode = (to: ThemeMode) => {
        setTheme(to);
    };

    return (
        <div role="radiogroup" className="flex flex-row gap-2">
            <ThemeButton
                active={mounted && theme === 'light'}
                icon="sun-bright"
                onClick={() => onSwitchMode('light')}
                title={tString(language, 'switch_to_light_theme')}
            />
            <ThemeButton
                active={mounted && theme === 'system'}
                icon="desktop"
                onClick={() => onSwitchMode('system')}
                title={tString(language, 'switch_to_system_theme')}
            />
            <ThemeButton
                active={mounted && theme === 'dark'}
                icon="moon"
                onClick={() => onSwitchMode('dark')}
                title={tString(language, 'switch_to_dark_theme')}
            />
        </div>
    );
}

function ThemeButton(props: {
    icon: IconName;
    onClick: () => void;
    title: string;
    active: boolean;
}) {
    const { icon, onClick, title, active } = props;
    return (
        <button
            type="button"
            role="radio"
            onClick={onClick}
            aria-label={title}
            title={title}
            aria-checked={active}
            className={tcls(
                'p-2',
                'rounded',
                'straight-corners:rounded-none',
                'transition-all',
                'text-dark/8',
                'dark:text-light/8',
                'contrast-more:text-dark',
                'dark:contrast-more:text-light',
                'hover:bg-dark/1',
                'dark:hover:bg-light/1',
                'contrast-more:hover:ring-2',
                'contrast-more:focus:ring-2',
                'ring-dark',
                'dark:ring-light',
                active && [
                    'bg-tint/2',
                    'hover:bg-tint/2',
                    'text-tint-600',
                    'dark:text-tint-400',
                    'contrast-more:text-tint-600',
                    'contrast-more:dark:text-tint-400',
                    'contrast-more:ring-1',
                    'ring-tint-600',
                    'dark:ring-tint-400',
                ],
            )}
        >
            <Icon icon={icon} className={tcls('size-4')} />
        </button>
    );
}
