'use client';

import React, { useCallback, useMemo } from 'react';

import { useHash, useIsMounted } from '@/components/hooks';
import * as storage from '@/lib/local-storage';
import { ClassValue, tcls } from '@/lib/tailwind';

interface TabsState {
    activeIds: {
        [tabsBlockId: string]: string;
    };
    activeTitles: string[];
}

const defaultTabsState: TabsState = {
    activeIds: {},
    activeTitles: [],
};

let globalTabsState = storage.getItem('@gitbook/tabsState', defaultTabsState);
const listeners = new Set<() => void>();

function useTabsState() {
    const subscribe = useCallback((callback: () => void) => {
        listeners.add(callback);
        return () => listeners.delete(callback);
    }, []);

    const getSnapshot = useCallback(() => globalTabsState, []);

    const setTabsState = useCallback((updater: (previous: TabsState) => TabsState) => {
        globalTabsState = updater(globalTabsState);
        storage.setItem('@gitbook/tabsState', globalTabsState);
        listeners.forEach((listener) => listener());
    }, []);
    const state = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return [state, setTabsState] as const;
}

// How many titles are remembered:
const TITLES_MAX = 5;

export interface TabsItem {
    id: string;
    title: string;
}

type SelectorMapper<Type> = {
    [Property in keyof Type]: Type[Property];
};
type TabsInput = {
    id: string;
    tabs: SelectorMapper<TabsItem>[];
};

interface TabsState {
    activeIds: {
        [tabsBlockId: string]: string;
    };
    activeTitles: string[];
}

/**
 * Client side component for the tabs, taking care of interactions.
 */
export function DynamicTabs(
    props: TabsInput & {
        tabsBody: React.ReactNode[];
        style: ClassValue;
    },
) {
    const { id, tabs, tabsBody, style } = props;

    const hash = useHash();
    const [tabsState, setTabsState] = useTabsState();
    const activeState = useMemo(() => {
        const input = { id, tabs };
        return (
            getTabBySelection(input, tabsState) ?? getTabByTitle(input, tabsState) ?? input.tabs[0]
        );
    }, [id, tabs, tabsState]);

    // To avoid issue with hydration, we only use the state from localStorage
    // once the component has been mounted.
    // Otherwise because of  the streaming/suspense approach, tabs can be first-rendered at different time
    // and get stuck into an inconsistent state.
    const mounted = useIsMounted();
    const active = mounted ? activeState : tabs[0];

    /**
     * When clicking to select a tab, we:
     * - mark this specific ID as selected
     * - store the ID to auto-select other tabs with the same title
     */
    const onSelectTab = React.useCallback(
        (tab: TabsItem) => {
            setTabsState((prev) => ({
                activeIds: {
                    ...prev.activeIds,
                    [id]: tab.id,
                },
                activeTitles: tab.title
                    ? prev.activeTitles
                          .filter((t) => t !== tab.title)
                          .concat([tab.title])
                          .slice(-TITLES_MAX)
                    : prev.activeTitles,
            }));
        },
        [id, setTabsState],
    );

    /**
     * When the hash changes, we try to select the tab containing the targetted element.
     */
    React.useEffect(() => {
        if (!hash) {
            return;
        }

        const activeElement = document.getElementById(hash);
        if (!activeElement) {
            return;
        }

        const tabAncestor = activeElement.closest('[role="tabpanel"]');
        if (!tabAncestor) {
            return;
        }

        const tab = tabs.find((tab) => getTabPanelId(tab.id) === tabAncestor.id);
        if (!tab) {
            return;
        }

        onSelectTab(tab);
    }, [hash, tabs, onSelectTab]);

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
                        aria-selected={active.id === tab.id}
                        aria-controls={getTabPanelId(tab.id)}
                        id={getTabButtonId(tab.id)}
                        onClick={() => {
                            onSelectTab(tab);
                        }}
                        className={tcls(
                            //prev from active-tab
                            '[&:has(+_.active-tab)]:rounded-br-md',

                            //next from active-tab
                            '[.active-tab_+_&]:rounded-bl-md',

                            //next from active-tab
                            '[.active-tab_+_:after]:rounded-br-md',

                            'inline-block',
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

                            'truncate',
                            'max-w-full',

                            active.id === tab.id
                                ? [
                                      'shrink-0',
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
            {tabs.map((tab, index) => (
                <div
                    key={tab.id}
                    role="tabpanel"
                    id={getTabPanelId(tab.id)}
                    aria-labelledby={getTabButtonId(tab.id)}
                    className={tcls('p-4', tab.id !== active.id ? 'hidden' : null)}
                >
                    {tabsBody[index]}
                </div>
            ))}
        </div>
    );
}

/**
 * Get the ID for a tab button.
 */
function getTabButtonId(tabId: string) {
    return `tab-${tabId}`;
}

/**
 * Get the ID for a tab panel.
 * We use the ID of the tab itself as links can be pointing to this ID.
 */
function getTabPanelId(tabId: string) {
    return tabId;
}

/**
 * Get explicitly selected tab in a set of tabs.
 */
function getTabBySelection(input: TabsInput, state: TabsState): TabsItem | null {
    const activeId = state.activeIds[input.id];
    return activeId ? (input.tabs.find((child) => child.id === activeId) ?? null) : null;
}

/**
 * Get the best selected tab in a set of tabs by taking only title into account.
 */
function getTabByTitle(input: TabsInput, state: TabsState): TabsItem | null {
    return (
        input.tabs
            .map((item) => {
                return {
                    item,
                    score: state.activeTitles.indexOf(item.title),
                };
            })
            .filter(({ score }) => score >= 0)
            // .sortBy(({ score }) => -score)
            .sort(({ score: a }, { score: b }) => b - a)
            .map(({ item }) => item)[0] ?? null
    );
}
