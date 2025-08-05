'use client';

import { type ClassValue, tcls } from '@/lib/tailwind';
import * as React from 'react';

function getOperatingSystem() {
    const platform = navigator.platform.toLowerCase();

    if (platform.includes('mac')) return 'mac';
    if (platform.includes('win')) return 'win';

    return 'win';
}

export function KeyboardShortcut(props: { keys: string[]; className?: ClassValue }) {
    const { keys, className } = props;

    const [operatingSystem, setOperatingSystem] = React.useState<string | null>(null);

    React.useEffect(() => {
        setOperatingSystem(getOperatingSystem());
    }, []);

    return (
        <div
            aria-busy={operatingSystem === null ? 'true' : undefined}
            className={tcls(
                'shortcut -mr-1 hidden justify-end gap-0.5 whitespace-nowrap text-tint text-xs [font-feature-settings:"calt","case"] contrast-more:text-tint-strong md:flex',
                operatingSystem
                    ? 'motion-safe:animate-fade-in motion-reduce:opacity-100'
                    : 'opacity-0'
            )}
        >
            {keys.map((key) => (
                <kbd
                    key={key}
                    className={tcls(
                        'flex h-5 min-w-5 items-center justify-center rounded-md border border-tint-subtle px-1',
                        key === 'mod'
                            ? operatingSystem === 'mac'
                                ? 'text-sm'
                                : 'text-xs'
                            : 'uppercase',
                        className
                    )}
                >
                    {key === 'mod' ? (operatingSystem === 'mac' ? '⌘' : 'Ctrl') : key}
                </kbd>
            ))}
        </div>
    );
}
