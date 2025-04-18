'use client';

import { useCallback } from 'react';
import type { Key } from 'react-aria';
import { useStore } from 'zustand';
import { OpenAPIPath } from './OpenAPIPath';
import { OpenAPISelect, OpenAPISelectItem } from './OpenAPISelect';
import { StaticSection } from './StaticSection';
import type { OpenAPIClientContext } from './context';
import { getOrCreateStoreByKey } from './getOrCreateStoreByKey';
import type { OpenAPIOperationData } from './types';

function useCodeSampleState(initialKey: Key = 'default') {
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

function OpenAPICodeSampleHeader(props: {
    items: CodeSampleItem[];
    data: OpenAPIOperationData;
    selectIcon?: React.ReactNode;
    context: OpenAPIClientContext;
}) {
    const { data, items, selectIcon, context } = props;

    return (
        <>
            <OpenAPIPath context={context} canCopy={false} withServer={false} data={data} />
            {items.length > 1 ? (
                <OpenAPISelect
                    icon={selectIcon}
                    items={items}
                    stateKey="codesample"
                    placement="bottom end"
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

export function OpenAPICodeSampleBody(props: {
    items: CodeSampleItem[];
    data: OpenAPIOperationData;
    selectIcon?: React.ReactNode;
    context: OpenAPIClientContext;
}) {
    const { items, data, selectIcon, context } = props;
    if (!items[0]) {
        throw new Error('No items provided');
    }

    const state = useCodeSampleState(items[0]?.key);

    const selected = items.find((item) => item.key === state.key) || items[0];

    if (!selected) {
        return null;
    }

    return (
        <StaticSection
            header={
                <OpenAPICodeSampleHeader
                    context={context}
                    selectIcon={selectIcon}
                    data={data}
                    items={items}
                />
            }
            className="openapi-codesample"
        >
            <div id={selected.key as string} className="openapi-codesample-panel">
                {selected.body ? selected.body : null}
                {selected.footer ? selected.footer : null}
            </div>
        </StaticSection>
    );
}
