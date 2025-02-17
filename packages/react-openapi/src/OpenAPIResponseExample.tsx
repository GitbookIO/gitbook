import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { generateSchemaExample } from './generateSchemaExample';
import type { OpenAPIContextProps, OpenAPIOperationData } from './types';
import { checkIsReference, createStateKey, resolveDescription } from './utils';
import { stringifyOpenAPI } from './stringifyOpenAPI';
import { OpenAPITabs, OpenAPITabsList, OpenAPITabsPanels } from './OpenAPITabs';
import { InteractiveSection } from './InteractiveSection';
import { Markdown } from './Markdown';
import React from 'react';
import { OpenAPIResponseMultipleExample } from './OpenAPIResponseMultipleExample';

/**
 * Display an example of the response content.
 */
export function OpenAPIResponseExample(props: {
    data: OpenAPIOperationData;
    context: OpenAPIContextProps;
}) {
    const { data, context } = props;

    // if there are no responses defined for the operation
    if (!data.operation.responses) {
        return null;
    }

    const responses = Object.entries(data.operation.responses);
    // Sort response to get 200, and 2xx first
    responses.sort(([a], [b]) => {
        if (a === 'default') {
            return 1;
        }
        if (b === 'default') {
            return -1;
        }
        if (a === '200') {
            return -1;
        }
        if (b === '200') {
            return 1;
        }
        return Number(a) - Number(b);
    });

    const examples = responses
        .map(([key, value]) => {
            const responseObject = value;
            const mediaTypeObject = (() => {
                if (!responseObject.content) {
                    return null;
                }
                const key = Object.keys(responseObject.content)[0];
                return (
                    responseObject.content['application/json'] ??
                    (key ? responseObject.content[key] : null)
                );
            })();

            if (!mediaTypeObject) {
                return {
                    key: key,
                    label: key,
                    description: resolveDescription(responseObject),
                    body: <OpenAPIEmptyResponseExample />,
                };
            }

            const examples = handleUnresolvedReference(
                (() => {
                    const { examples, example } = mediaTypeObject;
                    if (examples) {
                        if (Array.isArray(examples)) {
                            return examples.map((example) => ({
                                value: example,
                            }));
                        }

                        return Object.entries(examples).map(([key, value]) => ({
                            summary: key,
                            value: value,
                        }));
                    }

                    if (example) {
                        return { value: example };
                    }

                    const schema = mediaTypeObject.schema;
                    if (!schema) {
                        return null;
                    }

                    return { value: generateSchemaExample(schema) };
                })(),
            );

            if (!examples || (Array.isArray(examples) && examples.length === 0)) {
                return {
                    key: key,
                    label: key,
                    body: <OpenAPIEmptyResponseExample description={responseObject.description} />,
                };
            }

            return {
                key: key,
                label: key,
                body: (
                    <OpenAPIResponseExampleBody
                        examples={examples}
                        context={context}
                        description={responseObject.description}
                    />
                ),
            };
        })
        .filter((val): val is { key: string; label: string; body: any; description: string } =>
            Boolean(val),
        );

    if (examples.length === 0) {
        return null;
    }

    return (
        <OpenAPITabs stateKey={createStateKey('response-example')} items={examples}>
            <InteractiveSection header={<OpenAPITabsList />} className="openapi-response-example">
                <OpenAPITabsPanels />
            </InteractiveSection>
        </OpenAPITabs>
    );
}

function OpenAPIEmptyResponseExample(props: { description?: string }) {
    const { description } = props;

    return (
        <>
            <pre className="openapi-response-example-empty">
                <p>No body</p>
            </pre>

            {description ? <Markdown source={description} className="openapi-tabs-footer" /> : null}
        </>
    );
}

function OpenAPIResponseExampleBody(props: {
    examples: OpenAPIV3.ExampleObject[] | OpenAPIV3.ExampleObject;
    context: OpenAPIContextProps;
    description?: string;
}) {
    const { examples, context, description } = props;

    if (!Array.isArray(examples)) {
        return (
            <>
                <context.CodeBlock
                    code={
                        typeof examples.value === 'string'
                            ? examples.value
                            : stringifyOpenAPI(examples.value, null, 2)
                    }
                    syntax="json"
                />

                {description ? (
                    <Markdown source={description} className="openapi-tabs-footer" />
                ) : null}
            </>
        );
    }

    if (examples.length === 0) {
        return <OpenAPIEmptyResponseExample />;
    }

    return <OpenAPIResponseMultipleExample examples={examples} context={context} />;
}

function handleUnresolvedReference(
    input: OpenAPIV3.ExampleObject | OpenAPIV3.ExampleObject[] | null,
): OpenAPIV3.ExampleObject | OpenAPIV3.ExampleObject[] | null {
    if (Array.isArray(input)) {
        return input.map(
            (example) => handleUnresolvedReference(example) as OpenAPIV3.ExampleObject,
        );
    }

    const isReference = checkIsReference(input?.value);

    if (isReference) {
        // If we find a reference that wasn't resolved or needed to be resolved externally, render out the URL
        return { value: input.value.$ref };
    }

    return input;
}
