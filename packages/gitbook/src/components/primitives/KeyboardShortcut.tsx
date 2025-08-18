'use client';

import { type ClassValue, tcls } from '@/lib/tailwind';
import { Icon } from '@gitbook/icons';
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
                'shortcut hidden justify-end gap-0.5 whitespace-nowrap text-tint text-xs [font-feature-settings:"calt","case"] contrast-more:text-tint-strong md:flex',
                operatingSystem
                    ? 'motion-safe:animate-fade-in motion-reduce:opacity-100'
                    : 'opacity-0'
            )}
        >
            {keys.map((key, index) => {
                let element: React.ReactNode = key;

                switch (key) {
                    case 'mod':
                        element = operatingSystem === 'mac' ? '⌘' : 'Ctrl';
                        break;

                    case 'enter':
                        element = <Icon icon="arrow-turn-down-left" className="size-[.75em]" />;
                        break;
                }
                return (
                    <kbd
                        key={index}
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
                        {element}
                    </kbd>
                );
            })}
        </div>
    );
}
