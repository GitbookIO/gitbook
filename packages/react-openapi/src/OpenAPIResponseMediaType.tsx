'use client';
import type { Key } from 'react-aria';
import { OpenAPISelect, OpenAPISelectItem, useSelectState } from './OpenAPISelect';
import { StaticSection } from './StaticSection';
import { createStateKey } from './utils';

type OpenAPIResponseMediaTypeItem = OpenAPISelectItem & {
    body: React.ReactNode;
};

/**
 * Get the state of the response examples select.
 */
export function useResponseMediaTypesState(
    blockKey: string | undefined,
    initialKey: Key = 'default'
) {
    return useSelectState(getResponseMediaTypeExamplesStateKey(blockKey), initialKey);
}

export function OpenAPIResponseMediaTypeContent(props: {
    items: OpenAPIResponseMediaTypeItem[];
    blockKey?: string;
}) {
    const { blockKey, items } = props;

    return (
        <StaticSection
            footer={<OpenAPIResponseMediaTypeFooter blockKey={blockKey} items={items} />}
            className="openapi-response-media-types-examples"
        >
            <OpenAPIResponseMediaTypeBody blockKey={blockKey} items={items} />
        </StaticSection>
    );
}

function OpenAPIResponseMediaTypeFooter(props: {
    items: OpenAPIResponseMediaTypeItem[];
    blockKey?: string;
}) {
    const { items, blockKey } = props;

    if (items.length < 2) {
        return null;
    }

    return (
        <OpenAPISelect
            items={items}
            stateKey={getResponseMediaTypeExamplesStateKey(blockKey)}
            placement="bottom start"
        >
            {items.map((item) => (
                <OpenAPISelectItem key={item.key} id={item.key} value={item}>
                    <span>{item.label}</span>
                </OpenAPISelectItem>
            ))}
        </OpenAPISelect>
    );
}

function OpenAPIResponseMediaTypeBody(props: {
    items: OpenAPIResponseMediaTypeItem[];
    blockKey?: string;
}) {
    const { blockKey, items } = props;
    const state = useResponseMediaTypesState(blockKey, items[0]?.key);

    const selectedItem = items.find((item) => item.key === state.key) ?? items[0];

    if (!selectedItem) {
        return null;
    }

    return selectedItem.body;
}

/**
 * Return the state key for the response media types.
 */
function getResponseMediaTypeExamplesStateKey(blockKey: string | undefined) {
    return createStateKey('response-media-types-examples', blockKey);
}
