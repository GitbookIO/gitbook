'use client';

import clsx from 'clsx';
import { useStore } from 'zustand';
import { getStatusCodeClassName } from './OpenAPIResponses';
import { OpenAPISelect, OpenAPISelectItem } from './OpenAPISelect';
import { StaticSection } from './StaticSection';
import { getOrCreateStoreByKey } from './getOrCreateStoreByKey';

type OpenAPIResponseExampleItem = OpenAPISelectItem & {
    statusCode: string;
    body: React.ReactNode;
};

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
    const store = useStore(getOrCreateStoreByKey(`openapi-responses-${blockKey}`, items[0]?.key));

    const selectedItem = items.find((item) => item.key === store.key);

    return (
        <OpenAPISelect
            items={items}
            selectedKey={selectedItem?.key}
            onSelectionChange={(key) => store.setKey(key)}
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
    const store = useStore(getOrCreateStoreByKey(`openapi-responses-${blockKey}`, items[0]?.key));

    const selectedKey = store.key || '';

    const selectedItem = items.find((item) => item.key === selectedKey);

    if (!selectedItem) {
        return null;
    }

    return <div className="openapi-response-examples-panel">{selectedItem.body}</div>;
}
