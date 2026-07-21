'use client';

import type React from 'react';
import { type ComponentPropsWithRef, memo, useCallback, useMemo } from 'react';

import { useResolvedSlug, useSelect } from '@/components/Select';
import { useListOverflow } from '@/components/hooks';
import { DropdownMenu, DropdownMenuItem } from '@/components/primitives';
import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';
import { SELECT_DEFAULT_ATTR, SELECT_GROUP_ATTR, SELECT_OPTION_ATTR } from '@/lib/select';
import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';

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
 * (no flash) and with JS disabled. This component only handles clicks and the tablist's own
 * active/aria state.
 */
export function DynamicTabs(props: {
    tabs: TabsItem[];
    setClassName: string;
    className?: string;
}) {
    const { tabs, setClassName, className } = props;
    const { activate } = useSelect();

    const candidateSlugs = useMemo(() => tabs.map((tab) => tab.slug), [tabs]);
    // Only used for the tablist button highlight/aria; falls back to the first tab, matching the CSS
    // default. Pre-hydration this is the first tab on both server and client, so it never mismatches.
    const activeSlug = useResolvedSlug(candidateSlugs, tabs[0]?.slug ?? null);

    const selectTab = useCallback(
        (tabId: string) => {
            const tab = tabs.find((item) => item.id === tabId);
            if (tab?.slug) {
                activate(tab.slug);
            }
        },
        [tabs, activate]
    );

    return (
        <div
            {...{ [SELECT_GROUP_ATTR]: '' }}
            className={tcls(
                'rounded-lg',
                'straight-corners:rounded-xs',
                'ring-1 ring-tint-subtle ring-inset',
                'flex min-w-0 flex-col',
                setClassName,
                className
            )}
        >
            <TabItemList tabs={tabs} activeSlug={activeSlug} onSelect={selectTab} />
            {tabs.map((tab, index) => (
                <TabPanel key={tab.id} tab={tab} isDefault={index === 0} />
            ))}
        </div>
    );
}

const TabPanel = memo(function TabPanel(props: {
    tab: TabsItem;
    isDefault: boolean;
}) {
    const { tab, isDefault } = props;
    return (
        <div
            {...{
                [SELECT_OPTION_ATTR]: tab.slug,
                ...(isDefault ? { [SELECT_DEFAULT_ATTR]: '' } : {}),
            }}
            role="tabpanel"
            id={tab.id}
            aria-labelledby={getTabButtonId(tab.id)}
            className="scroll-mt-[calc(var(--content-scroll-margin)+var(--spacing)*20)]"
        >
            <div className="p-4">{tab.body}</div>
        </div>
    );
});

const TabItemList = memo(function TabItemList(props: {
    tabs: TabsItem[];
    activeSlug: string | null;
    onSelect: (tabId: string) => void;
}) {
    const { tabs, activeSlug, onSelect } = props;
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
                <TabsDropdownMenu tabs={tabs} onSelect={onSelect} activeSlug={activeSlug} />
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
                        isActive={tab.slug === activeSlug}
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
                    activeSlug={activeSlug}
                />
            ) : null}
        </div>
    );
});

function TabsDropdownMenu(props: {
    tabs: TabsItem[];
    activeSlug: string | null;
    onSelect: (tabId: string) => void;
}) {
    const { tabs, onSelect, activeSlug } = props;
    const language = useLanguage();
    return (
        <DropdownMenu
            button={
                <TabButton
                    isActive={tabs.some((tab) => tab.slug === activeSlug)}
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
                        active={tab.slug === activeSlug}
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
            {tab.icon && <Icon icon={tab.icon} className="size-4 shrink-0" />}
            <span className="min-w-0 truncate">{tab.title}</span>
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
                    'relative inline-flex max-w-full items-center gap-1.5 px-3.5 py-2 font-medium text-sm transition-[color]',
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
