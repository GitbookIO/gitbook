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
                'rounded-lg',
                'straight-corners:rounded-sm',
                'ring-1',
                'ring-inset',
                'ring-dark/3',
                'flex',
                'overflow-hidden',
                'flex-col',
                'dark:ring-light/2',
                style,
            )}
        >
            <div
                role="tablist"
                className={tcls(
                    'group/tabs',
                    'inline-flex',
                    'flex-row',
                    'self-stretch',
                    'after:flex-[1]',
                    'after:bg-dark-2/1',
                    // if last tab is selected, apply rounded to :after element
                    '[&:has(button.active-tab:last-of-type):after]:rounded-bl-md',
                    'dark:after:bg-dark-1/5',
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
                            //prev from active-tab
                            '[&:has(+_.active-tab)]:rounded-br-md',

                            //next from active-tab
                            '[.active-tab_+_&]:rounded-bl-md',

                            //next from active-tab
                            '[.active-tab_+_:after]:rounded-br-md',

                            'inline-flex',
                            'text-sm',
                            'px-3.5',
                            'py-2',
                            'transition-[color]',
                            'font-[500]',
                            'relative',

                            'after:transition-colors',
                            'after:group-hover/tabs:border-transparent',
                            'after:border-r',
                            'after:absolute',
                            'after:left-[unset]',
                            'after:right-0',
                            'after:border-dark/4',
                            'after:top-[15%]',
                            'after:h-[70%]',
                            'after:w-[1px]',

                            'last:after:border-transparent',

                            'text-dark-2/7',
                            'bg-dark-2/1',
                            'dark:bg-dark-1/5',
                            'hover:text-dark-2',

                            'dark:text-light-3/8',

                            'dark:after:border-light/2',
                            'dark:hover:text-light-3',

                            active === tab.id
                                ? [
                                      'active-tab',
                                      'text-dark-2',
                                      'bg-transparent',
                                      'dark:text-light',
                                      'dark:bg-transparent',
                                      'after:[&.active-tab]:border-transparent',
                                      'after:[:has(+_&.active-tab)]:border-transparent',
                                      'after:[:has(&_+)]:border-transparent',
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
