import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { OpenAPIExample } from '../OpenAPIExample';
import type { OpenAPIContext } from '../context';
import { generateSchemaExample } from '../generateSchemaExample';
import { tString } from '../translate';
import { checkIsReference } from '../utils';

/**
 * Generate an example from a reference object.
 */
export function getExampleFromReference(
    ref: OpenAPIV3.ReferenceObject,
    context: OpenAPIContext
): OpenAPIV3.ExampleObject {
    return {
        summary: tString(context.translation, 'unresolved_reference'),
        value: { $ref: ref.$ref },
    };
}

/**
 * Get examples from a media type object.
 */
export function getExamplesFromMediaTypeObject(args: {
    mediaType: string;
    mediaTypeObject: OpenAPIV3.MediaTypeObject;
    context: OpenAPIContext;
}): { key: string; example: OpenAPIV3.ExampleObject }[] {
    const { mediaTypeObject, mediaType, context } = args;
    if (mediaTypeObject.examples) {
        return Object.entries(mediaTypeObject.examples).map(([key, example]) => {
            return {
                key,
                example: checkIsReference(example)
                    ? getExampleFromReference(example, context)
                    : example,
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

/**
 * Get the examples from a media type object.
 */
export function getExamples(props: {
    mediaTypeObject: OpenAPIV3.MediaTypeObject;
    mediaType: string;
    context: OpenAPIContext;
}) {
    const { mediaTypeObject, mediaType, context } = props;
    const examples = getExamplesFromMediaTypeObject({ mediaTypeObject, mediaType, context });
    const syntax = getSyntaxFromMediaType(mediaType);

    return examples.map((example) => {
        return {
            key: example.key,
            label: example.example.summary || example.key,
            body: (
                <OpenAPIExample example={example.example} context={props.context} syntax={syntax} />
            ),
        };
    });
}

/**
 * Get the syntax from a media type.
 */
function getSyntaxFromMediaType(mediaType: string): string {
    if (mediaType.includes('json')) {
        return 'json';
    }

    if (mediaType.includes('yaml')) {
        return 'yaml';
    }

    if (mediaType === 'application/xml') {
        return 'xml';
    }

    return 'text';
}
