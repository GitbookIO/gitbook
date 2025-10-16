'use client';

import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ComponentPropsWithRef,
} from 'react';

import { NavigationStatusContext, useHash, useIsMounted } from '@/components/hooks';
import { DropdownMenu, DropdownMenuItem } from '@/components/primitives';
import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';
import { getLocalStorageItem, setLocalStorageItem } from '@/lib/browser';
import { type ClassValue, tcls } from '@/lib/tailwind';
import type { DocumentBlockTabs } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import { useRouter } from 'next/navigation';

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
    const { id, tabs, tabsBody, style } = props;
    const router = useRouter();
    const { onNavigationClick } = React.useContext(NavigationStatusContext);

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
    const selectTab = useCallback(
        (tabId: string) => {
            const tab = tabs.find((tab) => tab.id === tabId);

            if (!tab) {
                return;
            }

            const href = `#${tab.id}`;
            if (window.location.hash !== href) {
                router.replace(href);
                onNavigationClick(href);
            }

            setTabsState((prev) => {
                if (prev.activeIds[id] === tab.id) {
                    return prev;
                }
                return {
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
                };
            });
        },
        [onNavigationClick, router, setTabsState, tabs, id]
    );

    /**
     * When the hash changes, we try to select the tab containing the targetted element.
     */
    React.useEffect(() => {
        if (hash) {
            selectTab(hash);
        }
    }, [selectTab, hash]);

    return (
        <div
            className={tcls(
                'rounded-lg',
                'straight-corners:rounded-xs',
                'ring-1 ring-tint-subtle ring-inset',
                'flex flex-col',
                'overflow-hidden',
                style
            )}
        >
            <TabItemList tabs={tabs} activeTabId={active?.id ?? null} onSelect={selectTab} />
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

function TabItemList(props: {
    tabs: TabsItem[];
    activeTabId: string | null;
    onSelect: (id: string) => void;
}) {
    const { tabs, activeTabId, onSelect } = props;
    const { containerRef, itemRef, overflowing, isMeasuring } = useListOverflow();
    const overflowingTabs = useMemo(
        () =>
            Array.from(overflowing, (id) => {
                const tabId = getTabIdFromButtonId(id);
                return tabs.find((tab) => tab.id === tabId);
            }).filter((x) => x !== undefined),
        [overflowing, tabs]
    );
    return (
        <div
            ref={containerRef}
            role="tablist"
            className={tcls(
                'group/tabs',
                'inline-flex',
                'self-stretch',
                'after:flex-1',
                'after:bg-tint-12/1',
                // if last tab is selected, apply rounded to :after element
                '[&:has(button.active-tab:last-of-type):after]:rounded-bl-md'
            )}
        >
            {isMeasuring ? (
                <TabsDropdownMenu tabs={tabs} onSelect={onSelect} activeTabId={activeTabId} />
            ) : null}
            {tabs.map((tab) => {
                if (overflowing.has(getTabButtonId(tab.id)) && !isMeasuring) {
                    return null;
                }
                return (
                    <TabItem
                        key={tab.id}
                        ref={itemRef}
                        isActive={tab.id === activeTabId}
                        tab={tab}
                        onSelect={onSelect}
                    />
                );
            })}
            {overflowingTabs.length > 0 && !isMeasuring ? (
                <TabsDropdownMenu
                    tabs={overflowingTabs}
                    onSelect={onSelect}
                    activeTabId={activeTabId}
                />
            ) : null}
        </div>
    );
}

function TabsDropdownMenu(props: {
    tabs: TabsItem[];
    activeTabId: string | null;
    onSelect: (tabId: string) => void;
}) {
    const { tabs, onSelect, activeTabId } = props;
    const language = useLanguage();
    return (
        <DropdownMenu
            button={
                <TabButton
                    isActive={tabs.some((tab) => tab.id === activeTabId)}
                    aria-label={tString(language, 'more')}
                    className="shrink-0"
                >
                    <Icon icon="ellipsis" className="size-4" />
                </TabButton>
            }
        >
            {tabs.map((tab) => {
                return (
                    <DropdownMenuItem
                        key={tab.id}
                        onClick={() => onSelect(tab.id)}
                        active={tab.id === activeTabId}
                    >
                        {tab.title}
                    </DropdownMenuItem>
                );
            })}
        </DropdownMenu>
    );
}

interface OverflowState {
    /**
     * Ref for the container element.
     */
    containerRef: React.RefObject<HTMLDivElement | null>;
    /**
     * Ref callback for each item in the list.
     */
    itemRef: (element: HTMLElement | null) => void;
    /**
     * Set of IDs that are currently overflowing.
     */
    overflowing: Set<string>;
    /**
     * Indicates if we are currently measuring the list.
     */
    isMeasuring: boolean;
}

/**
 * Detects which items are overflowing in a horizontal list.
 */
function useListOverflow(): OverflowState {
    const containerRef = useRef<HTMLDivElement>(null);
    const [overflowing, setOverflowing] = useState<Set<string>>(new Set());
    const [isMeasuring, setIsMeasuring] = useState(false);
    const itemRefs = useRef(new Map<string, HTMLElement>());
    const rafRef = useRef(0);

    const itemRef = useCallback((element: HTMLElement | null) => {
        if (!element) {
            return;
        }
        itemRefs.current.set(element.id, element);
        return () => {
            itemRefs.current.delete(element.id);
        };
    }, []);

    // Measure on mount and when container size changes
    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        setIsMeasuring(true);

        const ro = new ResizeObserver(() => {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                setIsMeasuring(true);
            });
        });

        ro.observe(containerRef.current);

        return () => {
            ro.disconnect();
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    // Measure which items are overflowing
    useLayoutEffect(() => {
        if (!containerRef.current || !isMeasuring) {
            return;
        }

        const containerRect = containerRef.current.getBoundingClientRect();
        const newOverflowing = new Set<string>();

        itemRefs.current.forEach((el, id) => {
            const elRect = el.getBoundingClientRect();
            if (elRect.right > containerRect.right + 1) {
                newOverflowing.add(id);
            }
        });

        setOverflowing((previous) => {
            if (previous.size !== newOverflowing.size) {
                return newOverflowing;
            }
            for (const id of previous) {
                if (!newOverflowing.has(id)) {
                    return newOverflowing;
                }
            }
            return previous;
        });
        setIsMeasuring(false);
    }, [isMeasuring]);

    return { containerRef, itemRef, overflowing, isMeasuring };
}

function TabItem(props: {
    ref: React.Ref<HTMLButtonElement>;
    isActive: boolean;
    tab: TabsItem;
    onSelect: (tabId: string) => void;
}) {
    const { ref, tab, isActive, onSelect } = props;
    return (
        <TabButton
            ref={ref}
            role="tab"
            aria-selected={isActive}
            aria-controls={getTabPanelId(tab.id)}
            id={getTabButtonId(tab.id)}
            onClick={() => onSelect(tab.id)}
        >
            {tab.title}
        </TabButton>
    );
}

function TabButton(
    props: ComponentPropsWithRef<'button'> & {
        isActive?: boolean;
    }
) {
    const { isActive, ...rest } = props;
    return (
        <div
            className={tcls(
                'relative',
                'flex items-center',

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

                'last:after:border-transparent',

                'text-tint',
                'bg-tint-12/1',
                'hover:text-tint-strong',
                'max-w-full',
                'shrink-0',
                'truncate',

                props['aria-selected'] || props['aria-expanded'] || isActive
                    ? [
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
                {...rest}
                type="button"
                className={tcls(
                    'relative inline-block max-w-full truncate px-3.5 py-2 font-medium text-sm transition-[color]',
                    props.className
                )}
            />
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
 * Get the ID of a tab from a button ID.
 */
function getTabIdFromButtonId(buttonId: string) {
    if (buttonId.startsWith('tab-')) {
        return buttonId.slice(4);
    }
    return buttonId;
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
