'use client';

import React, { useCallback, useMemo } from 'react';

import { useHash, useIsMounted } from '@/components/hooks';
import { getLocalStorageItem, setLocalStorageItem } from '@/lib/browser';
import { type ClassValue, tcls } from '@/lib/tailwind';
import type { DocumentBlockTabs } from '@gitbook/api';
import { HashLinkButton, hashLinkButtonWrapperStyles } from '../HashLinkButton';

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

let globalTabsState = getLocalStorageItem('@gitbook/tabsState', defaultTabsState);
const listeners = new Set<() => void>();

function useTabsState() {
    const subscribe = useCallback((callback: () => void) => {
        listeners.add(callback);
        return () => listeners.delete(callback);
    }, []);

    const getSnapshot = useCallback(() => globalTabsState, []);

    const setTabsState = useCallback((updater: (previous: TabsState) => TabsState) => {
        globalTabsState = updater(globalTabsState);
        setLocalStorageItem('@gitbook/tabsState', globalTabsState);
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
        block: DocumentBlockTabs;
    }
) {
    const { id, block, tabs, tabsBody, style } = props;

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
        [id, setTabsState]
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
                'straight-corners:rounded-xs',
                'ring-1',
                'ring-inset',
                'ring-tint-subtle',
                'flex',
                'flex-col',
                'overflow-hidden',
                style
            )}
        >
            <div
                role="tablist"
                className={tcls(
                    'group/tabs',
                    'inline-flex',
                    'flex-row',
                    'self-stretch',
                    'after:flex-1',
                    'after:bg-tint-12/1',
                    // if last tab is selected, apply rounded to :after element
                    '[&:has(button.active-tab:last-of-type):after]:rounded-bl-md'
                )}
            >
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        className={tcls(
                            hashLinkButtonWrapperStyles,
                            'flex',
                            'items-center',
                            'gap-3.5',

                            //prev from active-tab
                            '[&:has(+_.active-tab)]:rounded-br-md',

                            //next from active-tab
                            '[.active-tab+&]:rounded-bl-md',

                            //next from active-tab
                            '[.active-tab_+_:after]:rounded-br-md',

                            'after:transition-colors',
                            'after:border-r',
                            'after:absolute',
                            'after:left-[unset]',
                            'after:right-0',
                            'after:border-tint',
                            'after:top-[15%]',
                            'after:h-[70%]',
                            'after:w-px',

                            'px-3.5',
                            'py-2',

                            'last:after:border-transparent',

                            'text-tint',
                            'bg-tint-12/1',
                            'hover:text-tint-strong',
                            'max-w-full',
                            'truncate',

                            active?.id === tab.id
                                ? [
                                      'shrink-0',
                                      'active-tab',
                                      'text-tint-strong',
                                      'bg-transparent',
                                      '[&.active-tab]:after:border-transparent',
                                      '[:has(+_&.active-tab)]:after:border-transparent',
                                      '[:has(&_+)]:after:border-transparent',
                                  ]
                                : null
                        )}
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={active?.id === tab.id}
                            aria-controls={getTabPanelId(tab.id)}
                            id={getTabButtonId(tab.id)}
                            onClick={() => {
                                onSelectTab(tab);
                            }}
                            className={tcls(
                                'inline-block',
                                'text-sm',
                                'transition-[color]',
                                'font-medium',
                                'relative',
                                'max-w-full',
                                'truncate'
                            )}
                        >
                            {tab.title}
                        </button>

                        <HashLinkButton
                            id={getTabButtonId(tab.id)}
                            block={block}
                            label="Direct link to tab"
                        />
                    </div>
                ))}
            </div>
            {tabs.map((tab, index) => (
                <div
                    key={tab.id}
                    role="tabpanel"
                    id={getTabPanelId(tab.id)}
                    aria-labelledby={getTabButtonId(tab.id)}
                    className={tcls('p-4', tab.id !== active?.id ? 'hidden' : null)}
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
