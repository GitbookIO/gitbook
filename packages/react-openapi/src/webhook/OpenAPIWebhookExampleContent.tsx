'use client';
import type { Key } from 'react-aria';
import { OpenAPIEmptyExample } from '../OpenAPIExample';
import { OpenAPISelect, OpenAPISelectItem, useSelectState } from '../OpenAPISelect';
import { StaticSection } from '../StaticSection';
import { createStateKey } from '../utils';

type OpenAPIWebhookMediaTypeItem = OpenAPISelectItem & {
    body: React.ReactNode;
    examples?: OpenAPIWebhookMediaTypeItem[];
};

/**
 * Get the state of the response examples select.
 */
export function useWebhookMediaTypesState(
    blockKey: string | undefined,
    initialKey: Key = 'default'
) {
    return useSelectState(getWebhookMediaTypeStateKey(blockKey), initialKey);
}

function useWebhookMediaTypeExamplesState(
    blockKey: string | undefined,
    initialKey: Key = 'default'
) {
    return useSelectState(getWebhookMediaTypeExamplesStateKey(blockKey), initialKey);
}

export function OpenAPIResponseMediaTypeContent(props: {
    items: OpenAPIWebhookMediaTypeItem[];
    blockKey?: string;
    selectIcon?: React.ReactNode;
}) {
    const { blockKey, items, selectIcon } = props;
    const state = useWebhookMediaTypesState(blockKey, items[0]?.key);

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
                        selectIcon={selectIcon}
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
    items: OpenAPIWebhookMediaTypeItem[];
    examples?: OpenAPIWebhookMediaTypeItem[];
    blockKey?: string;
    selectIcon?: React.ReactNode;
}) {
    const { items, examples, blockKey, selectIcon } = props;

    return (
        <>
            {items.length > 1 && (
                <OpenAPISelect
                    icon={selectIcon}
                    items={items}
                    stateKey={getWebhookMediaTypeStateKey(blockKey)}
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
                    icon={selectIcon}
                    items={examples}
                    stateKey={getWebhookMediaTypeExamplesStateKey(blockKey)}
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
    items: OpenAPIWebhookMediaTypeItem[];
    examples?: OpenAPIWebhookMediaTypeItem[];
    blockKey?: string;
}) {
    const { blockKey, items, examples } = props;
    const state = useWebhookMediaTypesState(blockKey, items[0]?.key);

    const selectedItem = items.find((item) => item.key === state.key) ?? items[0];

    const exampleState = useWebhookMediaTypeExamplesState(
        blockKey,
        selectedItem?.examples?.[0]?.key
    );

    if (!selectedItem) {
        return null;
    }

    if (examples?.length) {
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
function getWebhookMediaTypeStateKey(blockKey: string | undefined) {
    return createStateKey('request-body-media-type', blockKey);
}

function getWebhookMediaTypeExamplesStateKey(blockKey: string | undefined) {
    return createStateKey('request-media-types-examples', blockKey);
}
