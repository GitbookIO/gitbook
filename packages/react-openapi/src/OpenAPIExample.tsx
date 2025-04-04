import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { generateSchemaExample } from './generateSchemaExample';
import { json2xml } from './json2xml';
import { stringifyOpenAPI } from './stringifyOpenAPI';
import type { OpenAPIContext } from './types';
import { checkIsReference } from './utils';

/**
 * Display an example.
 */
export function OpenAPIExample(props: {
    example: OpenAPIV3.ExampleObject;
    context: OpenAPIContext;
    syntax: string;
}) {
    const { example, context, syntax } = props;
    const code = stringifyExample({ example, xml: syntax === 'xml' });

    if (code === null) {
        return <OpenAPIEmptyExample />;
    }

    return context.renderCodeBlock({ code, syntax });
}

function stringifyExample(args: { example: OpenAPIV3.ExampleObject; xml: boolean }): string | null {
    const { example, xml } = args;

    if (!example.value) {
        return null;
    }

    if (typeof example.value === 'string') {
        return example.value;
    }

    if (xml) {
        return json2xml(example.value);
    }

    return stringifyOpenAPI(example.value, null, 2);
}

/**
 * Empty response example.
 */
export function OpenAPIEmptyExample() {
    return (
        <pre className="openapi-example-empty">
            <p>No Content</p>
        </pre>
    );
}

/**
 * Generate an example from a reference object.
 */
export function getExampleFromReference(ref: OpenAPIV3.ReferenceObject): OpenAPIV3.ExampleObject {
    return { summary: 'Unresolved reference', value: { $ref: ref.$ref } };
}

/**
 * Get examples from a media type object.
 */
export function getExamplesFromMediaTypeObject(args: {
    mediaType: string;
    mediaTypeObject: OpenAPIV3.MediaTypeObject;
}): { key: string; example: OpenAPIV3.ExampleObject }[] {
    const { mediaTypeObject, mediaType } = args;
    if (mediaTypeObject.examples) {
        return Object.entries(mediaTypeObject.examples).map(([key, example]) => {
            return {
                key,
                example: checkIsReference(example) ? getExampleFromReference(example) : example,
            };
        });
    }

    if (mediaTypeObject.example) {
        return [{ key: 'default', example: { value: mediaTypeObject.example } }];
    }

    if (mediaTypeObject.schema) {
        if (mediaType === 'application/xml') {
            // @TODO normally we should use the name of the schema but we don't have it
            // fix it when we got the reference name
            const root = mediaTypeObject.schema.xml?.name ?? 'object';
            return [
                {
                    key: 'default',
                    example: {
                        value: {
                            [root]: generateSchemaExample(mediaTypeObject.schema, {
                                xml: mediaType === 'application/xml',
                                mode: 'read',
                            }),
                        },
                    },
                },
            ];
        }
        return [
            {
                key: 'default',
                example: {
                    value: generateSchemaExample(mediaTypeObject.schema, {
                        mode: 'read',
                    }),
                },
            },
        ];
    }
    return [];
}

/**
 * Get example from a schema object.
 */
export function getExampleFromSchema(args: {
    schema: OpenAPIV3.SchemaObject;
}): OpenAPIV3.ExampleObject {
    const { schema } = args;

    if (schema.example) {
        return { value: schema.example };
    }

    return { value: generateSchemaExample(schema, { mode: 'read' }) };
}
