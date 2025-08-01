'use client';

import clsx from 'clsx';
import type { Key } from 'react-aria';
import { OpenAPISelect, OpenAPISelectItem, useSelectState } from './OpenAPISelect';
import { StaticSection } from './StaticSection';
import { createStateKey, getStatusCodeClassName } from './utils';

type OpenAPIResponseExampleItem = OpenAPISelectItem & {
    statusCode: string;
    body: React.ReactNode;
};

/**
 * Get the state of the response examples select.
 */
export function useResponseExamplesState(
    blockKey: string | undefined,
    initialKey: Key = 'default'
) {
    return useSelectState(getResponseExampleStateKey(blockKey), initialKey);
}

export function OpenAPIResponseExampleContent(props: {
    items: OpenAPIResponseExampleItem[];
    blockKey?: string;
    selectIcon?: React.ReactNode;
}) {
    const { blockKey, items, selectIcon } = props;

    return (
        <StaticSection
            header={
                <OpenAPIResponseExampleHeader
                    selectIcon={selectIcon}
                    blockKey={blockKey}
                    items={items}
                />
            }
            className="openapi-response-examples"
        >
            <OpenAPIResponseExampleBody blockKey={blockKey} items={items} />
        </StaticSection>
    );
}

function OpenAPIResponseExampleHeader(props: {
    items: OpenAPIResponseExampleItem[];
    blockKey?: string;
    selectIcon?: React.ReactNode;
}) {
    const { items, blockKey, selectIcon } = props;

    if (items.length === 1) {
        const item = items[0];

        if (!item) {
            return null;
        }

        return (
            <span className="openapi-response-examples-statuscode-title">
                <OpenAPIResponseExampleItem item={item} />
            </span>
        );
    }

    return (
        <OpenAPISelect
            items={items}
            icon={selectIcon}
            stateKey={getResponseExampleStateKey(blockKey)}
            placement="bottom start"
        >
            {items.map((item) => (
                <OpenAPISelectItem key={item.key} id={item.key} value={item}>
                    <OpenAPIResponseExampleItem item={item} />
                </OpenAPISelectItem>
            ))}
        </OpenAPISelect>
    );
}

function OpenAPIResponseExampleItem(props: {
    item: OpenAPIResponseExampleItem;
}) {
    const { item } = props;
    return (
        <>
            <span
                className={clsx(
                    'openapi-statuscode',
                    `openapi-statuscode-${getStatusCodeClassName(item.statusCode)}`,
                    'openapi-response-examples-statuscode'
                )}
            >
                {item.statusCode}
            </span>
            <span className="openapi-response-examples-statuscode-label">{item.label}</span>
        </>
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

/**
 * Return the state key for the response examples.
 */
function getResponseExampleStateKey(blockKey: string | undefined) {
    return createStateKey('openapi-responses', blockKey);
}
