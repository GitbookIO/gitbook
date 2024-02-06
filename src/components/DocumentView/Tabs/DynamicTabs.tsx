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
            <div
                role="tablist"
                className={tcls(
                    'group/tabs',
                    'inline-flex',
                    'flex-row',
                    'p-4',
                    'self-start',
                    'space-x-1.5',
                )}
            >
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
                            'text-dark-3',
                            'relative',

                            'after:transition-colors',
                            'after:group-hover/tabs:border-transparent',
                            'after:border-r',
                            'after:absolute',
                            'after:left-[unset]',
                            'after:-right-[calc(0.25rem-.5px)]',
                            'after:border-dark/4',
                            'after:top-[10%]',
                            'after:h-[80%]',
                            'after:w-[1px]',

                            'last:after:border-transparent',
                            'hover:bg-light-2',

                            'dark:text-light-3',
                            'dark:hover:bg-dark-2',
                            'dark:after:border-light/2',

                            active === tab.id
                                ? [
                                      'active-tab',
                                      'text-dark-3',
                                      'bg-light-3/7',

                                      'after:[&.active-tab]:border-transparent',
                                      'after:[:has(+_&.active-tab)]:border-transparent',
                                      'after:[:has(&_+)]:border-transparent',

                                      'hover:bg-light-4/6',
                                      'dark:bg-dark-3',
                                      'dark:text-light',
                                      'dark:hover:bg-dark-4/7',
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
