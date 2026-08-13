'use client';

import { Select } from '@base-ui/react/select';
import clsx from 'classnames';
import { useCallback } from 'react';
import { useStore } from 'zustand';

import { getOrCreateStoreByKey } from './getOrCreateStoreByKey';
import { OpenAPITooltip } from './OpenAPITooltip';

export type Key = string | number;

export type OpenAPISelectItem = {
    key: Key;
    label: string | React.ReactNode;
};

/** react-aria's `placement`, reduced to what the call sites actually use. */
type Placement = 'bottom start' | 'bottom end' | 'top start' | 'top end';

interface OpenAPISelectProps<T extends OpenAPISelectItem> {
    items: T[];
    /** A function, not children: the trigger has to render the selected item's markup too. */
    children: (item: T) => React.ReactNode;
    className?: string;
    itemClassName?: string;
    placement?: Placement;
    stateKey?: string;
    value?: Key;
    defaultValue?: Key;
    onChange?: (key: Key) => void;
    /**
     * Icon to display in the select button.
     */
    icon?: React.ReactNode | null;
    /** Owned here because only this component holds the trigger the tooltip anchors to. */
    tooltip?: React.ReactNode;
}

export function useSelectState(stateKey = 'select-state', initialKey: Key = 'default') {
    const store = useStore(getOrCreateStoreByKey(stateKey, initialKey));
    return {
        key: store.key,
        setKey: useCallback((key: Key | null) => store.setKey(key), [store.setKey]),
    };
}

export function OpenAPISelect<T extends OpenAPISelectItem>(props: OpenAPISelectProps<T>) {
    const {
        icon,
        items,
        children,
        className,
        itemClassName,
        placement,
        stateKey,
        value,
        onChange,
        defaultValue,
        tooltip,
    } = props;

    const state = useSelectState(stateKey, defaultValue ?? items[0]?.key);
    const selected = items.find((item) => item.key === state.key) || items[0];
    const [side, align] = (placement ?? 'bottom start').split(' ') as [
        'bottom' | 'top',
        'start' | 'end',
    ];

    // An element, not a component: declaring one inline would give React a new type on every
    // render and remount the whole trigger each time.
    const trigger = (
        <Select.Trigger aria-label="OpenAPI Select">
            <Select.Value className="openapi-select-value">
                {(current) => {
                    const item = items.find((entry) => entry.key === current) ?? selected;
                    return item ? children(item) : null;
                }}
            </Select.Value>
            {icon !== null ? icon || '▼' : null}
        </Select.Trigger>
    );

    return (
        <Select.Root<Key>
            value={value ?? selected?.key}
            onValueChange={(key) => {
                onChange?.(key as Key);
                state.setKey(key as Key);
            }}
            // The select sits inside a document, so it must not lock scrolling behind a modal layer.
            modal={false}
        >
            <div className={clsx('openapi-select', className)}>
                {tooltip ? (
                    <OpenAPITooltip>
                        <OpenAPITooltip.Trigger render={trigger} />
                        <OpenAPITooltip.Content>{tooltip}</OpenAPITooltip.Content>
                    </OpenAPITooltip>
                ) : (
                    trigger
                )}
            </div>
            <Select.Portal>
                <Select.Positioner
                    className="openapi-select-positioner"
                    side={side}
                    align={align}
                    sideOffset={8}
                    // Absolute positioning makes floating-ui walk offset parents and read scroll
                    // offsets on every measure, which dominates the profile on long pages.
                    positionMethod="fixed"
                    // Base UI overlaps the trigger by default to line the selected item up with it.
                    alignItemWithTrigger={false}
                >
                    <Select.Popup className="openapi-select-popover">
                        {/* Base UI scrolls and reveals the selected item through the list, not the popup. */}
                        <Select.List className="openapi-select-list">
                            {items.map((item) => (
                                <OpenAPISelectItem
                                    key={item.key}
                                    value={item.key}
                                    className={itemClassName}
                                >
                                    {children(item)}
                                </OpenAPISelectItem>
                            ))}
                        </Select.List>
                    </Select.Popup>
                </Select.Positioner>
            </Select.Portal>
        </Select.Root>
    );
}

export function OpenAPISelectItem(props: {
    value: Key;
    children: React.ReactNode;
    className?: string;
}) {
    const { value, children, className } = props;
    return (
        <Select.Item
            value={value}
            className={({ selected, highlighted }) =>
                clsx(
                    'openapi-select-item',
                    {
                        'openapi-select-item-focused': highlighted,
                        'openapi-select-item-selected': selected,
                    },
                    className
                )
            }
        >
            {children}
        </Select.Item>
    );
}
