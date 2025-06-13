'use client';

import React, { useCallback, useMemo } from 'react';

import { useHash, useIsMounted } from '@/components/hooks';
import * as storage from '@/lib/local-storage';
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

    const position: string = 'top'; // TODO: Get position from tab block options
    const description = null; // TODO: Get description from tabs

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
                'flex',
                'flex-col',
                position === 'left' && 'gap-4 md:flex-row',
                position === 'right' && 'gap-4 md:flex-row-reverse',
                'overflow-hidden',

                style,
                // We need to inset the tabs container to make edge-to-edge scrolling work, since this container has overflow:hidden
                // Also important to put this after the `style` to override those.
                '-mx-4',
                'px-4',
                'sm:-mx-6',
                'sm:px-6',
                'md:mx-auto',
                'md:px-0',
                'w-auto',
                'md:w-full'
            )}
        >
            <div
                role="tablist"
                className={tcls(
                    'group/tabs',
                    'flex',
                    tabs.length > 3 ? 'md:flex-wrap' : '',

                    'overflow-x-auto',
                    'md:overflow-hidden',

                    'gap-1',
                    'pb-2',
                    'flex-row',

                    position === 'left' || position === 'right'
                        ? 'gap-2 md:max-w-[40%] md:flex-col'
                        : '',
                    'snap-x',
                    'snap-mandatory',

                    // We need to inset the tablist to make edge-to-edge scrolling work.
                    '-mx-4',
                    'px-4',
                    'scroll-px-4',
                    'sm:-mx-6',
                    'sm:px-6',
                    'sm:scroll-px-6',
                    'md:mx-0',
                    'md:px-0',
                    'md:scroll-px-0'
                )}
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={active.id === tab.id}
                        aria-controls={getTabPanelId(tab.id)}
                        id={getTabButtonId(tab.id)}
                        onClick={() => {
                            onSelectTab(tab);
                        }}
                        className={tcls(
                            hashLinkButtonWrapperStyles,
                            description
                                ? 'px-4 py-4 max-md:min-w-64 max-md:max-w-[calc(50%-0.25rem)] '
                                : 'px-4 py-1',
                            description && position === 'top'
                                ? 'max-w-[calc(50%-0.25rem)] max-md:min-w-64'
                                : 'max-w-full ',

                            'max-md:shrink-0',
                            'transition-colors',
                            'text-left',
                            'flex',
                            'flex-col',
                            'gap-1',

                            'rounded-md',
                            'straight-corners:rounded-none',
                            'circular-corners:rounded-2xl',
                            'focus:outline-none',
                            'focus-visible:ring-2',
                            'ring-inset',

                            'text-tint',
                            'snap-start',
                            active.id === tab.id
                                ? 'active-tab bg-primary-active text-primary-strong focus-visible:ring-primary-hover'
                                : 'hover:bg-tint-hover hover:text-tint-strong focus-visible:bg-tint-hover focus-visible:text-tint-strong focus-visible:ring-tint-hover'
                        )}
                    >
                        <div
                            className={tcls(
                                'flex flex-row items-center gap-1',
                                description ? 'font-semibold text-base' : 'font-medium text-sm'
                            )}
                        >
                            <div className="line-clamp-2">{tab.title}</div>
                            <HashLinkButton
                                id={getTabButtonId(tab.id)}
                                block={block}
                                label="Direct link to tab"
                                className={tcls(
                                    '-mt-px ml-auto',
                                    position === 'left' || position === 'right' || description
                                        ? 'max-md:-mr-3'
                                        : '-mr-3'
                                )}
                            />
                        </div>
                        {description ? (
                            <span className="line-clamp-5 text-sm">{description}</span>
                        ) : null}
                    </button>
                ))}
            </div>
            {tabs.map((tab, index) => (
                <div
                    key={tab.id}
                    role="tabpanel"
                    id={getTabPanelId(tab.id)}
                    aria-labelledby={getTabButtonId(tab.id)}
                    className={tcls(
                        'p-4',
                        'rounded-lg',
                        'flex-1',
                        'straight-corners:rounded-none',
                        'circular-corners:rounded-2xl',
                        'grow',
                        'ring-1',
                        'ring-inset',
                        'ring-tint-subtle',
                        tab.id !== active.id ? 'hidden' : null
                    )}
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
