'use client';

import clsx from 'classnames';
import { useCallback } from 'react';
import {
    Button,
    type Key,
    ListBox,
    ListBoxItem,
    type ListBoxItemProps,
    Popover,
    type PopoverProps,
    Select,
    type SelectProps,
    SelectValue,
} from 'react-aria-components';
import { useStore } from 'zustand';
import { getOrCreateStoreByKey } from './getOrCreateStoreByKey';

export type OpenAPISelectItem = {
    key: Key;
    label: string | React.ReactNode;
    /**
     * If `true`, selecting this item runs `onAction` instead of changing the selection,
     * leaving the current selection unchanged (e.g. an item that opens a dialog).
     */
    action?: boolean;
};

interface OpenAPISelectProps<T extends OpenAPISelectItem> extends Omit<SelectProps<T>, 'children'> {
    items: T[];
    children: React.ReactNode | ((item: T) => React.ReactNode);
    placement?: PopoverProps['placement'];
    stateKey?: string;
    /**
     * Icon to display in the select button.
     */
    icon?: React.ReactNode | null;
    /**
     * Called when an item flagged with `action` is selected. The selection is not changed.
     */
    onAction?: (key: Key) => void;
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
        placement,
        stateKey,
        value,
        onChange,
        defaultValue,
        onAction,
        ...selectProps
    } = props;

    const state = useSelectState(stateKey, defaultValue ?? items[0]?.key);

    const selected = items.find((item) => item.key === state.key) || items[0];

    return (
        <Select
            aria-label="OpenAPI Select"
            {...selectProps}
            value={value ?? selected?.key}
            onChange={(key) => {
                // Action items trigger a side effect without changing the selection.
                if (key !== null && items.find((item) => item.key === key)?.action) {
                    onAction?.(key);
                    return;
                }
                onChange?.(key);
                state.setKey(key);
            }}
            className={clsx('openapi-select', className)}
        >
            <Button>
                <SelectValue />
                {icon !== null ? icon || '▼' : null}
            </Button>
            <Popover placement={placement} className="openapi-select-popover">
                <ListBox className="openapi-select-listbox" items={items}>
                    {children}
                </ListBox>
            </Popover>
        </Select>
    );
}

export function OpenAPISelectItem(props: ListBoxItemProps) {
    return (
        <ListBoxItem
            {...props}
            className={({ isFocused, isSelected }) =>
                clsx(
                    'openapi-select-item',
                    {
                        'openapi-select-item-focused': isFocused,
                        'openapi-select-item-selected': isSelected,
                    },
                    props.className
                )
            }
        />
    );
}
