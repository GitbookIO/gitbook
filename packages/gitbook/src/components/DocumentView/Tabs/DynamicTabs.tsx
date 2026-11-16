'use client';

import type React from 'react';
import { type ComponentPropsWithRef, memo, useCallback, useMemo, useState } from 'react';

import { Icon, type IconName } from '@gitbook/icons';

import { useListOverflow } from '@/components/hooks';
import { DropdownMenu, DropdownMenuItem } from '@/components/primitives';
import { useResolvedSlug, useSelect } from '@/components/Select';
import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';
import { cx } from '@/lib/classnames';
import {
    SELECT_DEFAULT_ATTR,
    SELECT_GROUP_ATTR,
    SELECT_OPTION_ATTR,
    SELECT_PINNED_ATTR,
    SELECT_UNPINNED_ATTR,
} from '@/lib/select';
import { resolveAnchorURL } from '@/lib/urls';

export interface TabsItem {
    id: string;
    title: string;
    /** The `select` slug for this tab, derived from its title (see Tabs.tsx). */
    slug: string;
    icon?: IconName;
    body: React.ReactNode;
}

/**
 * Client side component for the tabs, taking care of interactions.
 *
 * Pane visibility is driven entirely by CSS (see generateSelectCSS): each pane carries its slug as
 * `data-select-option`, and the generated stylesheet shows the most-recently-activated one based on
 * the `data-sel-*` attributes on `<html>`. That means the correct pane is visible before hydration
 * (no flash) and with JS disabled.
 *
 * The one thing CSS can't decide is *which* of several same-named tabs in one group the visitor
 * clicked — by slug they're identical, so the stylesheet falls back to the first. After an explicit
 * click we pin the exact pane via `data-select-pinned`/`-unpinned` (a client-only override that
 * reverts to first-match on reload). The tablist highlight follows the same resolved tab.
 */
export function DynamicTabs(props: { tabs: TabsItem[]; setClassName: string; className?: string }) {
    const { tabs, setClassName, className } = props;
    const { activate } = useSelect();
    // The tab the visitor explicitly clicked this session (not persisted — reload reverts to CSS).
    const [manualId, setManualId] = useState<string | null>(null);

    const candidateSlugs = useMemo(() => tabs.map((tab) => tab.slug), [tabs]);
    const activeSlug = useResolvedSlug(candidateSlugs, tabs[0]?.slug ?? null);

    // Resolve which tab is shown. Default: the first tab of the active slug — matching the CSS
    // first-match. A manual click pins a specific tab, but only while its slug is the active one; if
    // the active slug is a duplicate and the pinned tab isn't the first of it, `override` carries the
    // pin so the panes below can steer CSS past first-match.
    const { activeTabId, override } = useMemo(() => {
        const firstMatch = tabs.find((tab) => tab.slug === activeSlug) ?? tabs[0];
        const manual = manualId ? tabs.find((tab) => tab.id === manualId) : undefined;
        const pinned =
            manual && manual.slug === activeSlug && manual.id !== firstMatch?.id ? manual : null;
        return { activeTabId: pinned?.id ?? firstMatch?.id ?? null, override: pinned };
    }, [tabs, activeSlug, manualId]);

    const selectTab = useCallback(
        (tabId: string) => {
            const tab = tabs.find((item) => item.id === tabId);
            if (!tab?.slug) {
                return;
            }
            activate(tab.slug);
            setManualId(tabId);
            // The hash is the only URL handle for a selection, so a copied URL lands on this tab and
            // `useSelectAnchor` re-activates its slug on load. We deliberately bypass the navigation
            // context: it would report a hash change and scroll the tab the visitor is already
            // looking at.
            window.history.replaceState(null, '', resolveAnchorURL(`#${tab.id}`, window.location));
        },
        [tabs, activate]
    );

    return (
        <div {...{ [SELECT_GROUP_ATTR]: '' }} className={cx('tabs-block', setClassName, className)}>
            <TabItemList tabs={tabs} activeTabId={activeTabId} onSelect={selectTab} />
            {tabs.map((tab, index) => (
                <TabPanel
                    key={tab.id}
                    tab={tab}
                    isDefault={index === 0}
                    pin={
                        override && tab.slug === override.slug
                            ? tab.id === override.id
                                ? 'pinned'
                                : 'unpinned'
                            : undefined
                    }
                />
            ))}
        </div>
    );
}

const TabPanel = memo(function TabPanel(props: {
    tab: TabsItem;
    isDefault: boolean;
    pin?: 'pinned' | 'unpinned';
}) {
    const { tab, isDefault, pin } = props;
    return (
        <div
            {...{
                [SELECT_OPTION_ATTR]: tab.slug,
                ...(isDefault ? { [SELECT_DEFAULT_ATTR]: '' } : {}),
                ...(pin === 'pinned' ? { [SELECT_PINNED_ATTR]: '' } : {}),
                ...(pin === 'unpinned' ? { [SELECT_UNPINNED_ATTR]: '' } : {}),
            }}
            role="tabpanel"
            id={tab.id}
            aria-labelledby={getTabButtonId(tab.id)}
            className="tabs-panel"
        >
            <div className="tabs-panel-body">{tab.body}</div>
        </div>
    );
});

const TabItemList = memo(function TabItemList(props: {
    tabs: TabsItem[];
    activeTabId: string | null;
    onSelect: (tabId: string) => void;
}) {
    const { tabs, activeTabId, onSelect } = props;
    // The active tab's width decides how many others fit, so a new selection re-measures.
    const { containerRef, itemRef, overflowing, isMeasuring } = useListOverflow(activeTabId);
    const overflowingTabs = useMemo(
        () =>
            Array.from(overflowing, (id) => {
                const tabId = getTabIdFromButtonId(id);
                return tabs.find((tab) => tab.id === tabId);
            }).filter((x) => x !== undefined),
        [overflowing, tabs]
    );
    // Roving tabindex: one tab stop for the strip, the active tab when it isn't in the overflow menu.
    const visibleTabs = tabs.filter((tab) => !overflowing.has(getTabButtonId(tab.id)));
    const focusableTabId =
        visibleTabs.find((tab) => tab.id === activeTabId)?.id ?? visibleTabs[0]?.id ?? null;
    return (
        <div
            ref={containerRef}
            role="tablist"
            onKeyDown={moveFocusBetweenTabs}
            className="tabs-list"
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
                        isFocusable={tab.id === focusableTabId}
                        isMeasuring={isMeasuring}
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
                        leadingIcon={tab.icon}
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
    isFocusable: boolean;
    isMeasuring: boolean;
    tab: TabsItem;
    onSelect: (tabId: string) => void;
}) {
    const { ref, tab, isActive, isFocusable, isMeasuring, onSelect } = props;
    return (
        <TabButton
            ref={ref}
            role="tab"
            aria-selected={isActive}
            tabIndex={isFocusable ? 0 : -1}
            aria-controls={tab.id}
            id={getTabButtonId(tab.id)}
            title={tab.title}
            onClick={() => onSelect(tab.id)}
            wrapperClassName={
                isActive
                    ? 'tabs-item-current'
                    : isMeasuring
                      ? // Measured after the active tab, at their narrowest, so the menu only takes
                        // the tabs that can't fit even truncated.
                        'tabs-item-measuring'
                      : // Equal shares capped at their own width, so no tab drops below that
                        // narrowest size; the high grow leaves the strip's filler only the leftover.
                        'tabs-item-fluid'
            }
        >
            {tab.icon && <Icon icon={tab.icon} className="tabs-button-icon" />}
            <span className="tabs-button-label">{tab.title}</span>
        </TabButton>
    );
});

/**
 * Generic tab button component, low-level.
 */
function TabButton(
    props: Omit<ComponentPropsWithRef<'button'>, 'type'> & {
        isActive?: boolean;
        wrapperClassName?: string;
    }
) {
    const { isActive, wrapperClassName, ...rest } = props;
    return (
        <div
            className={cx(
                'tabs-item',
                (props['aria-selected'] || props['aria-expanded'] || isActive) && 'active-tab',
                wrapperClassName
            )}
        >
            <button {...rest} type="button" className={cx('tabs-button', props.className)} />
        </div>
    );
}

/**
 * Arrow keys, Home and End move focus between the tabs of a tablist; Enter or Space then selects.
 */
function moveFocusBetweenTabs(event: React.KeyboardEvent<HTMLElement>) {
    const current = event.target instanceof HTMLElement ? event.target : null;
    if (current?.getAttribute('role') !== 'tab') {
        return;
    }
    const tabs = Array.from(
        event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])')
    );
    const index = tabs.indexOf(current);
    const isRTL = getComputedStyle(event.currentTarget).direction === 'rtl';
    const next = getNextTabIndex(event.key, index, tabs.length, isRTL);
    if (next === null) {
        return;
    }
    event.preventDefault();
    tabs[next]?.focus();
}

/**
 * Index of the tab to focus for a key press, or null when the key doesn't move focus.
 */
export function getNextTabIndex(
    key: string,
    index: number,
    count: number,
    isRTL = false
): number | null {
    if (index < 0 || count === 0) {
        return null;
    }
    const forward = isRTL ? 'ArrowLeft' : 'ArrowRight';
    const backward = isRTL ? 'ArrowRight' : 'ArrowLeft';
    switch (key) {
        case forward:
            return (index + 1) % count;
        case backward:
            return (index - 1 + count) % count;
        case 'Home':
            return 0;
        case 'End':
            return count - 1;
        default:
            return null;
    }
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
