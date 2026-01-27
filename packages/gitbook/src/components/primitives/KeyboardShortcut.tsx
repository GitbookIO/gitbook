'use client';

import { tcls } from '@/lib/tailwind';
import { Icon } from '@gitbook/icons';
import type * as React from 'react';

export type KeyboardShortcutProps = {
    keys: string[];
} & React.HTMLAttributes<HTMLDivElement>;

export function KeyboardShortcut(props: KeyboardShortcutProps) {
    const { keys, className } = props;

    return (
        <div
            className={tcls(
                'shortcut hidden justify-end gap-0.5 whitespace-nowrap text-tint text-xs [font-feature-settings:"calt","case"] contrast-more:text-tint-strong md:flex'
            )}
        >
            {keys.map((key, index) => {
                let element: React.ReactNode = key;

                switch (key) {
                    case 'mod':
                        element = (
                            <>
                                <span className="hidden [html.os-mac_&]:inline">⌘</span>
                                <span className="inline [html.os-mac_&]:hidden">Ctrl</span>
                            </>
                        );
                        break;

                    case 'enter':
                        element = <Icon icon="arrow-turn-down-left" className="size-[.9em]" />;
                        break;
                }
                return (
                    <kbd
                        key={index}
                        className={tcls(
                            'flex h-5 min-w-5 items-center justify-center rounded-md border border-tint-subtle px-1',
                            key === 'mod' ? 'text-xs [html.os-mac_&]:text-sm' : 'uppercase',
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
