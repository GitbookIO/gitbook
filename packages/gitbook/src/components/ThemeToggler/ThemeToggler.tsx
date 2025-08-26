'use client';

import type { IconName } from '@gitbook/icons';
import { useTheme } from 'next-themes';
import React from 'react';

import { tString, useLanguage } from '@/intl/client';
import { Button, ButtonGroup } from '../primitives';

type ThemeMode = 'light' | 'system' | 'dark';

/**
 * Buttons to toggle between light/system/dark modes.
 */
export function ThemeToggler() {
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
        <ButtonGroup role="radiogroup" className="gap-2" combinedShape={false}>
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
        </ButtonGroup>
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
        <Button
            type="button"
            role="radio"
            onClick={onClick}
            label={title}
            aria-checked={active}
            variant="blank"
            size="default"
            className={
                active
                    ? 'bg-primary theme-muted:bg-primary-hover text-primary-strong ring-primary hover:bg-primary contrast-more:text-primary-strong contrast-more:ring-1 [html.sidebar-filled.theme-bold.tint_&]:bg-primary-hover'
                    : ''
            }
            icon={icon}
            iconOnly
        />
    );
}
