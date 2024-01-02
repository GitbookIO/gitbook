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

    const [active, setActive] = React.useState<null | string>(tabs[0].id);

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
            <div role="tablist" className={tcls('flex', 'flex-row', 'p-4', 'space-x-1.5')}>
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
                            'rounded-md',
                            'px-3.5',
                            'py-2',
                            'transition-colors',
                            'font-semibold',
                            'text-dark-4',
                            'hover:bg-light-2',
                            'dark:text-light-5',
                            'dark:hover:bg-dark-2',
                            'dark:hover:text-light-4',
                            active === tab.id
                                ? [
                                      'text-dark-4',
                                      'bg-light-3',
                                      'hover:bg-light-4',
                                      'dark:bg-dark-4',
                                      'dark:text-light',
                                      'dark:hover:bg-dark-4/2',
                                      'dark:hover:text-light-3',
                                  ]
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
