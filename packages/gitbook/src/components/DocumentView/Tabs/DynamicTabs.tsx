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

    const orientation: string = 'horizontal'; // TODO: Get orientation from tab block options
    const position: string = 'start'; // TODO: Get position from tab block options
    const description = null; // TODO: Get description from tabs

    // To avoid issue with hydration, we only use the state from localStorage
    // once the component has been mounted.
    // Otherwise because of the streaming/suspense approach, tabs can be first-rendered at different time
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
                'overflow-hidden',
                'pb-1',

                orientation === 'horizontal' && position === 'start' && 'flex-col',
                orientation === 'vertical' && position === 'start' && 'md:flex-row',
                orientation === 'vertical' && position === 'end' && 'md:flex-row-reverse',

                style
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
                    'gap-x-1',
                    'flex-row',
                    orientation === 'vertical' && 'gap-1.5 md:max-w-[40%] md:flex-col',
                    'snap-x',
                    'snap-mandatory',
                    '-mb-px',
                    'peer',
                    orientation === 'vertical' && position === 'start' && 'md:-mr-px md:mb-0',
                    orientation === 'vertical' && position === 'end' && 'md:-ml-px md:mb-0'
                )}
            >
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        className={tcls(
                            'tab -mx-4 flex overflow-hidden px-4 max-md:shrink-0 max-md:last:pr-0 [&:first-child>button]:before:hidden',
                            active.id === tab.id && 'active-tab z-20',
                            description && [
                                'min-w-56 max-md:max-w-[calc(33.33%+1.75rem)]',
                                orientation === 'horizontal' && 'md:max-w-[calc(33.33%+1.75rem)]',
                            ]
                        )}
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-orientation={orientation as 'horizontal' | 'vertical'}
                            aria-selected={active.id === tab.id}
                            aria-controls={getTabPanelId(tab.id)}
                            id={getTabButtonId(tab.id)}
                            onClick={() => {
                                onSelectTab(tab);
                            }}
                            className={tcls(
                                hashLinkButtonWrapperStyles,
                                description ? 'p-4' : 'px-4 py-1.5',
                                'grow',
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
                                'border',
                                'relative',

                                // Flared corners
                                'before:absolute before:size-4 before:transition-all before:content-[""] focus-visible:before:hidden',
                                'before:end-full',
                                'before:bottom-0',
                                'before:rounded-ee-md',
                                'circular-corners:before:rounded-ee-2xl',
                                'before:border-e before:border-b',
                                'before:shadow-[4px_4px_0_1px_var(--tw-shadow-color)]',

                                'after:absolute after:size-4 after:transition-all after:content-[""] focus-visible:after:hidden',
                                'after:start-full',
                                'after:bottom-0',
                                'after:rounded-es-md',
                                'circular-corners:after:rounded-es-2xl',
                                'after:border-s after:border-b',
                                'after:shadow-[-4px_4px_0_1px_var(--tw-shadow-color)]',

                                active.id === tab.id
                                    ? [
                                          'before:border-tint-subtle after:border-tint-subtle',
                                          'before:shadow-tint-1 after:shadow-tint-1',
                                      ]
                                    : [
                                          'before:border-tint-subtle after:border-tint-subtle',
                                          'before:shadow-tint-2 after:shadow-tint-2',
                                          'hover:after:shadow-tint-4 hover:before:shadow-tint-4',
                                      ],
                                orientation === 'vertical' && 'md:after:hidden md:before:hidden',
                                'straight-corners:before:hidden straight-corners:after:hidden',

                                'max-md:!rounded-b-none max-md:border-b-0',

                                // Position-specific adjustments
                                orientation === 'horizontal' &&
                                    position === 'start' &&
                                    'md:!rounded-b-none md:border-b-0',
                                orientation === 'vertical' &&
                                    position === 'start' &&
                                    'md:!rounded-r-none md:border-r-0',
                                orientation === 'vertical' &&
                                    position === 'end' &&
                                    'md:!rounded-l-none md:border-l-0',

                                'text-tint',
                                'snap-start',
                                active.id === tab.id
                                    ? ['border-tint-subtle bg-tint-base text-tint-strong']
                                    : [
                                          'border-tint-subtle bg-tint-subtle',
                                          'hover:z-10 hover:border-tint-subtle hover:bg-tint-hover hover:text-tint-strong',
                                          'focus-visible:z-10 focus-visible:bg-tint-hover focus-visible:text-tint-strong',
                                      ]
                            )}
                        >
                            <div
                                className={tcls(
                                    'flex flex-row items-center gap-1',
                                    description ? 'font-semibold text-base' : 'font-medium text-sm'
                                )}
                            >
                                <div
                                    className={tcls(
                                        'line-clamp-2',
                                        active.id === tab.id && 'text-primary-subtle'
                                    )}
                                >
                                    {tab.title}
                                </div>
                                <HashLinkButton
                                    id={getTabButtonId(tab.id)}
                                    block={block}
                                    label="Direct link to tab"
                                    className={tcls(
                                        '-mt-px ml-auto',
                                        orientation === 'vertical' || description
                                            ? 'max-md:-mr-3'
                                            : '-mr-3'
                                    )}
                                />
                            </div>
                            {description ? (
                                <p className="line-clamp-5 text-sm">{description}</p>
                            ) : null}
                        </button>
                    </div>
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
                        'rounded-md',
                        'straight-corners:rounded-none',
                        'circular-corners:rounded-2xl',
                        'z-10',
                        'bg-tint-base',
                        position === 'start' && '!rounded-tl-none',
                        position === 'end' && '!rounded-tr-none',
                        'transition-all',
                        'ring-1',
                        'ring-inset',
                        'ring-tint-subtle',
                        'grow',
                        'depth-subtle:shadow-sm',
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
            .sort(({ score: a }, { score: b }) => b - a)
            .map(({ item }) => item)[0] ?? null
    );
}
