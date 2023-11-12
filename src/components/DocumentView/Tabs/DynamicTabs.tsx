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
        <div className={tcls('rounded', 'border', 'border-slate-200', 'flex', 'flex-col', style)}>
            <div role="tablist" className={tcls('flex', 'flex-row', 'p-4')}>
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
                            'bg-slate-50',
                            'text-sm',
                            'textslate-700',
                            'rounded',
                            'px-4',
                            'py-2',
                            'me-2',
                            active === tab.id ? ['bg-slate-100'] : null,
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
