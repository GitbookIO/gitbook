'use client';

import type { Key } from 'react-aria';
import { OpenAPIEmptyExample } from './OpenAPIExample';
import { OpenAPISelect, OpenAPISelectItem, useSelectState } from './OpenAPISelect';
import { StaticSection } from './StaticSection';
import type { OpenAPIClientContext } from './context';

type OpenAPIMediaTypeItem = OpenAPISelectItem & {
    body: React.ReactNode;
    examples?: OpenAPIMediaTypeItem[];
};

/**
 * Get the state of the response examples select.
 */
export function useMediaTypesState(stateKey: string | undefined, initialKey: Key = 'default') {
    return useSelectState(stateKey, initialKey);
}

function useMediaTypeExamplesState(stateKey: string | undefined, initialKey: Key = 'default') {
    return useSelectState(stateKey, initialKey);
}

export function OpenAPIMediaTypeContent(props: {
    items: OpenAPIMediaTypeItem[];
    selectIcon?: React.ReactNode;
    stateKey: string;
    context: OpenAPIClientContext;
}) {
    const { stateKey, items, selectIcon, context } = props;
    const state = useMediaTypesState(stateKey, items[0]?.key);

    const examples = items.find((item) => item.key === state.key)?.examples ?? [];

    if (!items.length && !examples.length) {
        return null;
    }

    return (
        <StaticSection
            footer={
                items.length > 1 || examples.length > 1 ? (
                    <OpenAPIMediaTypeFooter
                        items={items}
                        examples={examples}
                        selectIcon={selectIcon}
                        stateKey={stateKey}
                    />
                ) : null
            }
            className="openapi-response-media-types-examples"
        >
            <OpenAPIMediaTypeBody
                context={context}
                stateKey={stateKey}
                items={items}
                examples={examples}
            />
        </StaticSection>
    );
}

function OpenAPIMediaTypeFooter(props: {
    items: OpenAPIMediaTypeItem[];
    examples?: OpenAPIMediaTypeItem[];
    selectIcon?: React.ReactNode;
    stateKey: string;
}) {
    const { items, examples, stateKey, selectIcon } = props;

    return (
        <>
            {items.length > 1 && (
                <OpenAPISelect
                    icon={selectIcon}
                    items={items}
                    stateKey={stateKey}
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
                    stateKey={`${stateKey}-examples`}
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

function OpenAPIMediaTypeBody(props: {
    items: OpenAPIMediaTypeItem[];
    examples?: OpenAPIMediaTypeItem[];
    stateKey: string;
    context: OpenAPIClientContext;
}) {
    const { stateKey, items, examples, context } = props;
    const state = useMediaTypesState(stateKey, items[0]?.key);

    const selectedItem = items.find((item) => item.key === state.key) ?? items[0];

    const exampleState = useMediaTypeExamplesState(
        `${stateKey}-examples`,
        selectedItem?.examples?.[0]?.key
    );

    if (!selectedItem) {
        return null;
    }

    if (examples) {
        const selectedExample =
            examples.find((example) => example.key === exampleState.key) ?? examples[0];

        if (!selectedExample) {
            return <OpenAPIEmptyExample context={context} />;
        }

        return selectedExample.body;
    }

    return selectedItem.body;
}
