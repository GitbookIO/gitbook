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
        <div
            role="radiogroup"
            className={tcls(
                'flex',
                'flex-row',
                'rounded-full',
                'straight-corners:rounded-sm',
                'border',
                'border-dark/3',
                'dark:border-light/2',
            )}
        >
            <ThemeButton
                active={mounted && theme === 'light'}
                icon="sun-bright"
                onClick={() => onSwitchMode('light')}
                title={tString(language, 'switch_to_light_theme')}
            />
            <ThemeButton
                active={mounted && theme === 'system'}
                icon="deskpro"
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
            aria-checked={active}
            className={tcls(
                'p-1',
                'm-1',
                'group',
                'rounded-full',
                'straight-corners:rounded-sm',
                active ? ['bg-primary-600/4', 'dark:bg-primary-400/2'] : null,
                'text-dark',
                'dark:text-light/7',
            )}
        >
            <Icon
                icon={icon}
                className={tcls(
                    'size-4',
                    active ? ['text-primary-600', 'dark:text-primary-400'] : null,
                )}
            />
        </button>
    );
}
