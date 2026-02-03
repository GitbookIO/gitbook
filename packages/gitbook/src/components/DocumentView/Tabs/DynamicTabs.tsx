'use client';

import React, {
    memo,
    useCallback,
    useMemo,
    useRef,
    useState,
    type ComponentPropsWithRef,
} from 'react';

import { NavigationStatusContext, useListOverflow } from '@/components/hooks';
import { DropdownMenu, DropdownMenuItem } from '@/components/primitives';
import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';
import { getLocalStorageItem, setLocalStorageItem } from '@/lib/browser';
import { tcls } from '@/lib/tailwind';
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
    body: React.ReactNode;
}

interface TabsState {
    activeIds: {
        [tabsBlockId: string]: string;
    };
    activeTitles: string[];
}

/**
 * Client side component for the tabs, taking care of interactions.
 */
export function DynamicTabs(props: {
    id: string;
    tabs: TabsItem[];
    className?: string;
}) {
    const { id, tabs, className } = props;
    const router = useRouter();

    const { onNavigationClick, hash } = React.useContext(NavigationStatusContext);
    const [initialized, setInitialized] = useState(false);
    const [tabsState, setTabsState] = useTabsState();
    const activeState = useMemo(() => {
        const input = { id, tabs };
        return (
            getTabBySelection(input, tabsState) ?? getTabByTitle(input, tabsState) ?? input.tabs[0]
        );
    }, [id, tabs, tabsState]);

    // Track if the tab has been touched by the user.
    const touchedRef = useRef(false);

    // To avoid issue with hydration, we only use the state from localStorage
    // once the component has been initialized (=mounted).
    // Otherwise because of  the streaming/suspense approach, tabs can be first-rendered at different time
    // and get stuck into an inconsistent state.
    const active = initialized ? activeState : tabs[0];

    // When clicking to select a tab, we:
    // - update the URL hash
    // - mark this specific ID as selected
    // - store the ID to auto-select other tabs with the same title
    const selectTab = useCallback(
        (tabId: string, manual = true) => {
            const tab = tabs.find((tab) => tab.id === tabId);

            if (!tab) {
                return;
            }

            if (manual) {
                touchedRef.current = true;
                const href = `#${tab.id}`;
                if (window.location.hash !== href) {
                    onNavigationClick(href);
                    router.replace(href, { scroll: false });
                }
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
        [router, setTabsState, tabs, id]
    );

    // When the hash changes, we try to select the tab containing the targetted element.
    React.useLayoutEffect(() => {
        setInitialized(true);

        if (hash) {
            // First check if the hash matches a tab ID.
            const hashIsTab = tabs.some((tab) => tab.id === hash);
            if (hashIsTab) {
                selectTab(hash, false);
                return;
            }

            // Then check if the hash matches an element inside a tab.
            const activeElement = document.getElementById(hash);
            if (!activeElement) {
                return;
            }

            const tabPanel = activeElement.closest('[role="tabpanel"]');
            if (!tabPanel) {
                return;
            }

            selectTab(tabPanel.id, false);
        }
    }, [selectTab, tabs, hash]);

    // Scroll to active element in the tab.
    React.useLayoutEffect(() => {
        // If there is no hash or active tab, nothing to scroll.
        if (!hash || hash !== '' || !active) {
            return;
        }

        // If the tab is touched, we don't want to scroll.
        if (touchedRef.current) {
            return;
        }

        // If the hash matches a tab, then the scroll is already done.
        const hashIsTab = tabs.some((tab) => tab.id === hash);
        if (hashIsTab) {
            return;
        }

        const activeElement = document.getElementById(hash);
        if (!activeElement) {
            return;
        }

        activeElement.scrollIntoView({
            block: 'start',
            behavior: 'instant',
        });
    }, [active, tabs, hash]);

    return (
        <div
            className={tcls(
                'rounded-lg',
                'straight-corners:rounded-xs',
                'ring-1 ring-tint-subtle ring-inset',
                'flex min-w-0 flex-col',
                className
            )}
        >
            <TabItemList tabs={tabs} activeTabId={active?.id ?? null} onSelect={selectTab} />
            {tabs.map((tab) => (
                <TabPanel key={tab.id} tab={tab} isActive={tab.id === active?.id} />
            ))}
        </div>
    );
}

const TabPanel = memo(function TabPanel(props: {
    tab: TabsItem;
    isActive: boolean;
}) {
    const { tab, isActive } = props;
    return (
        <div
            role="tabpanel"
            id={tab.id}
            aria-labelledby={getTabButtonId(tab.id)}
            className="scroll-mt-[calc(var(--content-scroll-margin)+var(--spacing)*20)]"
        >
            <div className={tcls('p-4')} hidden={!isActive}>
                {tab.body}
            </div>
        </div>
    );
});

const TabItemList = memo(function TabItemList(props: {
    tabs: TabsItem[];
    activeTabId: string | null;
    onSelect: (tabId: string) => void;
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
                'overflow-hidden',
                'rounded-t-lg',
                'straight-corners:rounded-t-xs',
                'inline-flex',
                'self-stretch',
                'after:flex-1',
                'after:bg-tint-12/1',
                // if last tab is selected, apply rounded to :after element
                '[&:has(button.active-tab:last-of-type):after]:rounded-bl-md'
            )}
        >
            {/* When we measure, we add the menu at start to be sure everything's fit. */}
            {isMeasuring ? (
                <TabsDropdownMenu tabs={tabs} onSelect={onSelect} activeTabId={activeTabId} />
            ) : null}
            {tabs.map((tab) => {
                // Hide overflowing tabs when not measuring.
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
            {/* Dropdown for overflowing tabs */}
            {overflowingTabs.length > 0 && !isMeasuring ? (
                <TabsDropdownMenu
                    tabs={overflowingTabs}
                    onSelect={onSelect}
                    activeTabId={activeTabId}
                />
            ) : null}
        </div>
    );
});

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

/**
 * Tab item that accepts a `tab` prop.
 */
const TabItem = memo(function TabItem(props: {
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
            aria-controls={tab.id}
            id={getTabButtonId(tab.id)}
            onClick={() => onSelect(tab.id)}
        >
            {tab.title}
        </TabButton>
    );
});

/**
 * Generic tab button component, low-level.
 */
function TabButton(
    props: Omit<ComponentPropsWithRef<'button'>, 'type'> & {
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
 * Get explicitly selected tab in a set of tabs.
 */
function getTabBySelection(
    input: {
        id: string;
        tabs: TabsItem[];
    },
    state: TabsState
): TabsItem | null {
    const activeId = state.activeIds[input.id];
    return activeId ? (input.tabs.find((child) => child.id === activeId) ?? null) : null;
}

/**
 * Get the best selected tab in a set of tabs by taking only title into account.
 */
function getTabByTitle(
    input: {
        id: string;
        tabs: TabsItem[];
    },
    state: TabsState
): TabsItem | null {
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
