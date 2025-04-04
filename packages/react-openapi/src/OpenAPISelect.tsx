'use client';

import clsx from 'clsx';
import {
    Button,
    type Key,
    ListBox,
    ListBoxItem,
    type ListBoxItemProps,
    Popover,
    Select,
    type SelectProps,
    SelectValue,
} from 'react-aria-components';

export type OpenAPISelectItem = {
    key: Key;
    label: string;
};

interface OpenAPISelectProps<T extends OpenAPISelectItem> extends Omit<SelectProps<T>, 'children'> {
    items: T[];
    children: React.ReactNode | ((item: T) => React.ReactNode);
    selectedKey?: Key;
    onChange?: (key: string | number) => void;
}

export function OpenAPISelect<T extends OpenAPISelectItem>(props: OpenAPISelectProps<T>) {
    const { items, children, className, selectedKey, onChange } = props;

    return (
        <Select
            {...props}
            className={clsx('openapi-select', className)}
            selectedKey={selectedKey}
            onSelectionChange={onChange}
        >
            <Button>
                <SelectValue />
                <span aria-hidden="true">
                    <svg
                        className="gb-icon"
                        style={{
                            maskImage:
                                "url('https://ka-p.fontawesome.com/releases/v6.6.0/svgs/regular/chevron-down.svg?v=2&token=a463935e93')",
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center center',
                        }}
                    />
                </span>
            </Button>
            <Popover placement="bottom end" className="openapi-select-popover">
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
