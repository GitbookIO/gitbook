'use client';

import React from 'react';

import { ClassValue, tcls } from '@/lib/tailwind';

/**
 * Client side component for the tabs, taking care of interactions.
 */
export function DynamicTabs(props: {
    tabs: Array<{
        id: string;
        title: string;
        children: React.ReactNode;
    }>;
    style: ClassValue;
}) {
    const { tabs, style } = props;

    const [active, setActive] = React.useState<null | string>(null);

    return (
        <div
            className={tcls(
                'rounded-md',
                'border',
                'border-dark/2',
                'flex',
                'flex-col',
                'dark:border-light/3',
                style,
            )}
        >
            <div role="tablist" className={tcls('flex', 'flex-row', 'p-4', 'space-x-2')}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={active === tab.id}
                        aria-controls={`tabpanel-${tab.id}`}
                        id={`tab-${tab.id}`}
                        onClick={() => {
                            setActive(tab.id);
                        }}
                        className={tcls(
                            'bg-transparent',
                            'text-sm',
                            'rounded-full',
                            'px-4',
                            'py-2',
                            'transition-colors',
                            'hover:bg-dark/1',
                            'font-semibold',
                            'text-dark/7',
                            'dark:text-light/6',
                            active === tab.id
                                ? ['text-dark', 'bg-dark/2', 'dark:bg-light/2', 'dark:text-light']
                                : null,
                        )}
                    >
                        {tab.title}
                    </button>
                ))}
            </div>
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    role="tabpanel"
                    id={`tabpanel-${tab.id}`}
                    aria-labelledby={`tab-${tab.id}`}
                    className={tcls('p-4', tab.id !== active ? 'hidden' : null)}
                >
                    {tab.children}
                </div>
            ))}
        </div>
    );
}
