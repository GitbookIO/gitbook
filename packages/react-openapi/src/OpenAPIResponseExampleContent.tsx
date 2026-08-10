'use client';

import clsx from 'classnames';
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
export function useResponseExamplesState(initialKey: Key = 'default') {
    return useSelectState(getResponseExampleStateKey(), initialKey);
}

export function OpenAPIResponseExampleContent(props: {
    items: OpenAPIResponseExampleItem[];
    selectIcon?: React.ReactNode;
}) {
    const { items, selectIcon } = props;

    return (
        <StaticSection
            header={<OpenAPIResponseExampleHeader selectIcon={selectIcon} items={items} />}
            className="openapi-response-examples"
        >
            <OpenAPIResponseExampleBody items={items} />
        </StaticSection>
    );
}

function OpenAPIResponseExampleHeader(props: {
    items: OpenAPIResponseExampleItem[];
    selectIcon?: React.ReactNode;
}) {
    const { items, selectIcon } = props;

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
            stateKey={getResponseExampleStateKey()}
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
}) {
    const { items } = props;
    const state = useResponseExamplesState(items[0]?.key);

    const selectedItem = items.find((item) => item.key === state.key) ?? items[0];

    if (!selectedItem) {
        return null;
    }

    return <div className="openapi-response-examples-panel">{selectedItem.body}</div>;
}

/**
 * Return the state key for the response examples. Not scoped to a block so the selected response
 * stays in sync across every operation on the page (like the code sample language selector).
 */
function getResponseExampleStateKey() {
    return createStateKey('openapi-responses');
}
