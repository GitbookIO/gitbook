'use client';

import clsx from 'clsx';
import { useCallback } from 'react';
import type { Key } from 'react-aria';
import { useStore } from 'zustand';
import { getStatusCodeClassName } from './OpenAPIResponses';
import { OpenAPISelect, OpenAPISelectItem } from './OpenAPISelect';
import { StaticSection } from './StaticSection';
import { getOrCreateStoreByKey } from './getOrCreateStoreByKey';

type OpenAPIResponseExampleItem = OpenAPISelectItem & {
    statusCode: string;
    body: React.ReactNode;
};

export function useResponseExamplesState(
    blockKey: string | undefined,
    initialKey: Key = 'default'
) {
    const store = useStore(getOrCreateStoreByKey(`openapi-responses-${blockKey}`, initialKey));
    return {
        key: store.key,
        setKey: useCallback((key: Key | null) => store.setKey(key), [store.setKey]),
    };
}

export function OpenAPIResponseExampleContent(props: {
    items: OpenAPIResponseExampleItem[];
    blockKey?: string;
}) {
    const { blockKey, items } = props;

    return (
        <StaticSection
            header={<OpenAPIResponseExampleHeader blockKey={blockKey} items={items} />}
            className="openapi-response-examples"
        >
            <OpenAPIResponseExampleBody blockKey={blockKey} items={items} />
        </StaticSection>
    );
}

function OpenAPIResponseExampleHeader(props: {
    items: OpenAPIResponseExampleItem[];
    blockKey?: string;
}) {
    const { items, blockKey } = props;
    const state = useResponseExamplesState(blockKey, items[0]?.key);

    const selectedItem = items.find((item) => item.key === state.key);

    if (items.length === 1) {
        const item = items[0];

        if (!item) {
            return null;
        }

        return (
            <span className="openapi-response-examples-statuscode-title">
                <span
                    className={clsx(
                        'openapi-statuscode',
                        `openapi-statuscode-${getStatusCodeClassName(item.statusCode)}`,
                        'openapi-response-examples-statuscode'
                    )}
                >
                    {item.statusCode}
                </span>
                <span>{item.label}</span>
            </span>
        );
    }

    return (
        <OpenAPISelect
            items={items}
            selectedKey={selectedItem?.key}
            onSelectionChange={(key) => state.setKey(key)}
        >
            {items.map((item) => (
                <OpenAPISelectItem key={item.key} id={item.key} value={item}>
                    <span
                        className={clsx(
                            'openapi-statuscode',
                            `openapi-statuscode-${getStatusCodeClassName(item.statusCode)}`,
                            'openapi-response-examples-statuscode'
                        )}
                    >
                        {item.statusCode}
                    </span>
                    <span>{item.label}</span>
                </OpenAPISelectItem>
            ))}
        </OpenAPISelect>
    );
}

function OpenAPIResponseExampleBody(props: {
    items: OpenAPIResponseExampleItem[];
    blockKey?: string;
}) {
    const { blockKey, items } = props;
    const state = useResponseExamplesState(blockKey, items[0]?.key);

    const selectedItem = items.find((item) => item.key === state.key) ?? items[0];

    if (!selectedItem) {
        return null;
    }

    return <div className="openapi-response-examples-panel">{selectedItem.body}</div>;
}
