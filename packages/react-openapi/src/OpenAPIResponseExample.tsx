import * as React from 'react';
import { InteractiveSection } from './InteractiveSection';
import { OpenAPIOperationData } from './fetchOpenAPIOperation';
import { generateSchemaExample } from './generateSchemaExample';
import { OpenAPIContextProps } from './types';
import { noReference } from './utils';

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
        .map((response) => {
            const responseObject = noReference(response[1]);

            const schema = noReference(
                (
                    responseObject.content?.['application/json'] ??
                    responseObject.content?.[Object.keys(responseObject.content)[0]]
                )?.schema,
            );

            if (!schema) {
                return null;
            }

            const example = generateSchemaExample(schema);
            if (example === undefined) {
                return null;
            }

            return {
                key: `${response[0]}`,
                label: `${response[0]}`,
                body: (
                    <context.CodeBlock
                        code={
                            typeof example === 'string' ? example : JSON.stringify(example, null, 2)
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
            header="Response"
            className="openapi-response-example"
            tabs={examples}
        />
    );
}
