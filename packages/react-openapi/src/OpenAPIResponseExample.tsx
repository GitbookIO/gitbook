import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { generateSchemaExample } from './generateSchemaExample';
import type { OpenAPIContextProps, OpenAPIOperationData } from './types';
import { checkIsReference, noReference, resolveDescription } from './utils';
import { stringifyOpenAPI } from './stringifyOpenAPI';
import { OpenAPITabs, OpenAPITabsList, OpenAPITabsPanels } from './OpenAPITabs';
import { InteractiveSection } from './InteractiveSection';

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

            const example = handleUnresolvedReference(
                (() => {
                    const { examples, example } = mediaTypeObject;
                    if (examples) {
                        const key = Object.keys(examples)[0];
                        if (key) {
                            // @TODO handle multiple examples
                            const firstExample = noReference(examples[key]);
                            if (firstExample) {
                                return firstExample;
                            }
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

            return {
                key: key,
                label: key,
                description: resolveDescription(responseObject),
                body: example?.value ? (
                    <context.CodeBlock
                        code={
                            typeof example.value === 'string'
                                ? example.value
                                : stringifyOpenAPI(example.value, null, 2)
                        }
                        syntax="json"
                    />
                ) : (
                    <OpenAPIEmptyResponseExample />
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
        <OpenAPITabs items={examples}>
            <InteractiveSection header={<OpenAPITabsList />} className="openapi-response-example">
                <OpenAPITabsPanels />
            </InteractiveSection>
        </OpenAPITabs>
    );
}

function OpenAPIEmptyResponseExample() {
    return (
        <pre className="openapi-response-example-empty">
            <p>No body</p>
        </pre>
    );
}

function handleUnresolvedReference(
    input: OpenAPIV3.ExampleObject | null,
): OpenAPIV3.ExampleObject | null {
    const isReference = checkIsReference(input?.value);

    if (isReference) {
        // If we find a reference that wasn't resolved or needed to be resolved externally, render out the URL
        return { value: input.value.$ref };
    }

    return input;
}
