'use client';

import type * as React from 'react';

import { Icon } from '@gitbook/icons';

import { cx } from '@/lib/classnames';

export type KeyboardShortcutProps = {
    keys: string[];
} & React.HTMLAttributes<HTMLDivElement>;

export function KeyboardShortcut(props: KeyboardShortcutProps) {
    const { keys, className } = props;

    return (
        <div className="shortcut">
            {keys.map((key, index) => {
                let element: React.ReactNode = key;

                switch (key) {
                    case 'mod':
                        element = (
                            <>
                                <span className="shortcut-mac">⌘</span>
                                <span className="shortcut-ctrl">Ctrl</span>
                            </>
                        );
                        break;

                    case 'enter':
                        element = <Icon icon="arrow-turn-down-left" className="shortcut-icon" />;
                        break;

                    case 'up':
                        element = <Icon icon="arrow-up" className="shortcut-icon" />;
                        break;

                    case 'down':
                        element = <Icon icon="arrow-down" className="shortcut-icon" />;
                        break;
                }
                return (
                    <kbd
                        key={index}
                        className={cx(
                            'shortcut-key',
                            key === 'mod' ? 'shortcut-key-mod' : 'uppercase',
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
