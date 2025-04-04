'use client';

import { useCallback } from 'react';
import type { Key } from 'react-aria';
import { useStore } from 'zustand';
import { OpenAPIPath } from './OpenAPIPath';
import { OpenAPISelect, OpenAPISelectItem } from './OpenAPISelect';
import { getOrCreateStoreByKey } from './getOrCreateStoreByKey';
import type { OpenAPIOperationData } from './types';

function useCodeSampleState(initialKey: Key = '') {
    const store = useStore(getOrCreateStoreByKey('codesample', initialKey));
    return {
        key: store.key,
        setKey: useCallback((key: Key) => store.setKey(key), [store.setKey]),
    };
}

type CodeSampleItem = OpenAPISelectItem & {
    body: React.ReactNode;
    footer?: React.ReactNode;
};

export function OpenAPICodeSampleHeader(props: {
    items: CodeSampleItem[];
    data: OpenAPIOperationData;
}) {
    const { data, items } = props;

    const state = useCodeSampleState(items[0]?.key ?? '');
    const selected = items.find((item) => item.key === state.key) || items[0];

    return (
        <>
            <OpenAPIPath canCopy={false} withServer={false} data={data} />
            {items.length > 1 ? (
                <OpenAPISelect
                    selectedKey={selected?.key}
                    onChange={(key) => {
                        state.setKey(key);
                    }}
                    items={items}
                    defaultSelectedKey={items[0]?.key}
                >
                    {items.map((item) => (
                        <OpenAPISelectItem key={item.key} id={item.key} value={item}>
                            {item.label}
                        </OpenAPISelectItem>
                    ))}
                </OpenAPISelect>
            ) : items[0] ? (
                <span className="openapi-codesample-label">{items[0].label}</span>
            ) : null}
        </>
    );
}

export function OpenAPICodeSampleBody(props: { items: CodeSampleItem[] }) {
    const { items } = props;
    const state = useCodeSampleState(items[0]?.key ?? '');

    const selected = items.find((item) => item.key === state.key) || items[0];

    return (
        <div id={selected?.key as string} className="openapi-codesample-panel">
            {selected?.body}
            {selected?.footer ? selected.footer : null}
        </div>
    );
}
