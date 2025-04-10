'use client';
import type { Key } from 'react-aria';
import { OpenAPIEmptyExample } from './OpenAPIExample';
import { OpenAPISelect, OpenAPISelectItem, useSelectState } from './OpenAPISelect';
import { StaticSection } from './StaticSection';
import { createStateKey } from './utils';

type OpenAPIResponseMediaTypeItem = OpenAPISelectItem & {
    body: React.ReactNode;
    examples?: OpenAPIResponseMediaTypeItem[];
};

/**
 * Get the state of the response examples select.
 */
export function useResponseMediaTypesState(
    blockKey: string | undefined,
    initialKey: Key = 'default'
) {
    return useSelectState(getResponseMediaTypeStateKey(blockKey), initialKey);
}

function useResponseMediaTypeExamplesState(
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
    const state = useResponseMediaTypesState(blockKey, items[0]?.key);

    const examples = items.find((item) => item.key === state.key)?.examples ?? [];

    if (!items.length && !examples.length) {
        return null;
    }

    return (
        <StaticSection
            footer={
                items.length > 1 || examples.length > 1 ? (
                    <OpenAPIResponseMediaTypeFooter
                        blockKey={blockKey}
                        items={items}
                        examples={examples}
                    />
                ) : null
            }
            className="openapi-response-media-types-examples"
        >
            <OpenAPIResponseMediaTypeBody blockKey={blockKey} items={items} examples={examples} />
        </StaticSection>
    );
}

function OpenAPIResponseMediaTypeFooter(props: {
    items: OpenAPIResponseMediaTypeItem[];
    examples?: OpenAPIResponseMediaTypeItem[];
    blockKey?: string;
}) {
    const { items, examples, blockKey } = props;

    return (
        <>
            {items.length > 1 && (
                <OpenAPISelect
                    items={items}
                    stateKey={getResponseMediaTypeStateKey(blockKey)}
                    placement="bottom start"
                >
                    {items.map((item) => (
                        <OpenAPISelectItem key={item.key} id={item.key} value={item}>
                            <span>{item.label}</span>
                        </OpenAPISelectItem>
                    ))}
                </OpenAPISelect>
            )}

            {examples && examples.length > 1 ? (
                <OpenAPISelect
                    items={examples}
                    stateKey={getResponseMediaTypeExamplesStateKey(blockKey)}
                    placement="bottom start"
                >
                    {examples.map((example) => (
                        <OpenAPISelectItem key={example.key} id={example.key} value={example}>
                            <span>{example.label}</span>
                        </OpenAPISelectItem>
                    ))}
                </OpenAPISelect>
            ) : null}
        </>
    );
}

function OpenAPIResponseMediaTypeBody(props: {
    items: OpenAPIResponseMediaTypeItem[];
    examples?: OpenAPIResponseMediaTypeItem[];
    blockKey?: string;
}) {
    const { blockKey, items, examples } = props;
    const state = useResponseMediaTypesState(blockKey, items[0]?.key);

    const selectedItem = items.find((item) => item.key === state.key) ?? items[0];

    const exampleState = useResponseMediaTypeExamplesState(
        blockKey,
        selectedItem?.examples?.[0]?.key
    );

    if (!selectedItem) {
        return null;
    }

    if (examples) {
        const selectedExample =
            examples.find((example) => example.key === exampleState.key) ?? examples[0];

        if (!selectedExample) {
            return <OpenAPIEmptyExample />;
        }

        return selectedExample.body;
    }

    return selectedItem.body;
}

/**
 * Return the state key for the response media types.
 */
function getResponseMediaTypeStateKey(blockKey: string | undefined) {
    return createStateKey('response-media-types', blockKey);
}

function getResponseMediaTypeExamplesStateKey(blockKey: string | undefined) {
    return createStateKey('response-media-types-examples', blockKey);
}
