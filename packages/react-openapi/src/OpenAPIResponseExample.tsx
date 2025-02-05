import * as React from 'react';
import { InteractiveSection } from './InteractiveSection';
import { OpenAPIOperationData } from './fetchOpenAPIOperation';
import { generateSchemaExample } from './generateSchemaExample';
import { OpenAPIContextProps } from './types';
import { checkIsReference, createStateKey, noReference } from './utils';
import { stringifyOpenAPI } from './stringifyOpenAPI';
import { OpenAPIV3 } from '@scalar/openapi-types';

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
            const responseObject = noReference(value);
            const mediaTypeObject = (() => {
                if (!responseObject.content) {
                    return null;
                }
                return (
                    responseObject.content['application/json'] ??
                    responseObject.content[Object.keys(responseObject.content)[0]]
                );
            })();

            if (!mediaTypeObject) {
                return null;
            }

            const example: OpenAPIV3.ExampleObject | null = handleUnresolvedReference(
                (() => {
                    const { examples, example } = mediaTypeObject;
                    if (examples) {
                        const firstKey = Object.keys(examples)[0];
                        // @TODO handle multiple examples
                        const firstExample = noReference(examples[firstKey]);
                        if (firstExample) {
                            return firstExample;
                        }
                    }

                    if (example) {
                        return { value: example };
                    }

                    const schema = noReference(mediaTypeObject.schema);
                    if (!schema) {
                        return null;
                    }

                    return { value: generateSchemaExample(schema) };
                })(),
            );

            if (!example?.value) {
                return null;
            }

            return {
                key: key,
                label: key,
                body: (
                    <context.CodeBlock
                        code={
                            typeof example.value === 'string'
                                ? example.value
                                : stringifyOpenAPI(example.value, null, 2)
                        }
                        syntax="json"
                    />
                ),
            };
        })
        .filter((val): val is { key: string; label: string; body: any } => Boolean(val));

    if (examples.length === 0) {
        return null;
    }

    return (
        <InteractiveSection
            stateKey={createStateKey('response', context.blockKey)}
            header="Response"
            className="openapi-response-example"
            tabs={examples}
        />
    );
}

function handleUnresolvedReference(input: OpenAPIV3.ExampleObject | null): OpenAPIV3.ExampleObject {
    const isReference = checkIsReference(input?.value);

    if (isReference || input === null) {
        // If we find a reference that wasn't resolved or needed to be resolved externally, render an empty object
        return { value: {} };
    }

    return input;
}
