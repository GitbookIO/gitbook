'use client';

import clsx from 'clsx';
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
};

interface OpenAPISelectProps<T extends OpenAPISelectItem> extends Omit<SelectProps<T>, 'children'> {
    items: T[];
    children: React.ReactNode | ((item: T) => React.ReactNode);
    placement?: PopoverProps['placement'];
    stateKey?: string;
    /**
     * Icon to display in the select button.
     */
    icon?: React.ReactNode;
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
        icon = '▼',
        items,
        children,
        className,
        placement,
        stateKey,
        selectedKey,
        onSelectionChange,
    } = props;

    const state = useSelectState(stateKey, items[0]?.key);

    const selected = items.find((item) => item.key === state.key) || items[0];

    return (
        <Select
            aria-label="OpenAPI Select"
            {...props}
            selectedKey={selectedKey || selected?.key}
            onSelectionChange={(key) => {
                onSelectionChange?.(key);
                state.setKey(key);
            }}
            className={clsx('openapi-select', className)}
        >
            <Button>
                <SelectValue />
                {icon}
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
                clsx('openapi-select-item', {
                    'openapi-select-item-focused': isFocused,
                    'openapi-select-item-selected': isSelected,
                })
            }
        />
    );
}
