'use client';

import { type ClassValue, tcls } from '@/lib/tailwind';
import * as React from 'react';

export function KeyboardShortcut(props: { keys: string[]; className?: ClassValue }) {
    const { keys, className } = props;

    const [operatingSystem, setOperatingSystem] = React.useState<string | null>(null);

    React.useEffect(() => {
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
            {keys.map((key) => (
                <kbd
                    key={key}
                    className={tcls(
                        'flex size-5 items-center justify-center rounded-md border border-tint-subtle',
                        key === 'mod' ? (operatingSystem === 'mac' ? 'text-sm' : '') : 'uppercase',
                        className
                    )}
                >
                    {key === 'mod' ? (operatingSystem === 'mac' ? '⌘' : 'Ctrl') : key}
                </kbd>
            ))}
        </div>
    );
}
