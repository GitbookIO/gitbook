import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { Markdown } from './Markdown';
import { OpenAPITabs, OpenAPITabsList, OpenAPITabsPanels } from './OpenAPITabs';
import { StaticSection } from './StaticSection';
import { generateSchemaExample } from './generateSchemaExample';
import { json2xml } from './json2xml';
import { stringifyOpenAPI } from './stringifyOpenAPI';
import type { OpenAPIContextProps, OpenAPIOperationData } from './types';
import { checkIsReference, createStateKey, resolveDescription } from './utils';

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

    const tabs = responses.map(([key, responseObject]) => {
        const description = resolveDescription(responseObject);

        if (checkIsReference(responseObject)) {
            return {
                key: key,
                label: key,
                body: (
                    <OpenAPIExample
                        example={getExampleFromReference(responseObject)}
                        context={context}
                        syntax="json"
                    />
                ),
                footer: description ? <Markdown source={description} /> : undefined,
            };
        }

        if (!responseObject.content || Object.keys(responseObject.content).length === 0) {
            return {
                key: key,
                label: key,
                body: <OpenAPIEmptyResponseExample />,
                footer: description ? <Markdown source={description} /> : undefined,
            };
        }

        return {
            key: key,
            label: key,
            body: <OpenAPIResponse context={context} content={responseObject.content} />,
            footer: description ? <Markdown source={description} /> : undefined,
        };
    });

    if (tabs.length === 0) {
        return null;
    }

    return (
        <OpenAPITabs stateKey={createStateKey('response-example')} items={tabs}>
            <StaticSection header={<OpenAPITabsList />} className="openapi-response-example">
                <OpenAPITabsPanels />
            </StaticSection>
        </OpenAPITabs>
    );
}

function OpenAPIResponse(props: {
    context: OpenAPIContextProps;
    content: {
        [media: string]: OpenAPIV3.MediaTypeObject;
    };
}) {
    const { context, content } = props;

    const entries = Object.entries(content);
    const firstEntry = entries[0];

    if (!firstEntry) {
        throw new Error('One media type is required');
    }

    if (entries.length === 1) {
        const [mediaType, mediaTypeObject] = firstEntry;
        return (
            <OpenAPIResponseMediaType
                context={context}
                mediaType={mediaType}
                mediaTypeObject={mediaTypeObject}
            />
        );
    }

    const tabs = entries.map((entry) => {
        const [mediaType, mediaTypeObject] = entry;
        return {
            key: mediaType,
            label: mediaType,
            body: (
                <OpenAPIResponseMediaType
                    context={context}
                    mediaType={mediaType}
                    mediaTypeObject={mediaTypeObject}
                />
            ),
        };
    });

    return (
        <OpenAPITabs stateKey={createStateKey('response-media-types')} items={tabs}>
            <StaticSection header={<OpenAPITabsList />} className="openapi-response-media-types">
                <OpenAPITabsPanels />
            </StaticSection>
        </OpenAPITabs>
    );
}

function OpenAPIResponseMediaType(props: {
    mediaTypeObject: OpenAPIV3.MediaTypeObject;
    mediaType: string;
    context: OpenAPIContextProps;
}) {
    const { mediaTypeObject, mediaType } = props;
    const examples = getExamplesFromMediaTypeObject({ mediaTypeObject, mediaType });
    const syntax = getSyntaxFromMediaType(mediaType);
    const firstExample = examples[0];

    if (!firstExample) {
        return <OpenAPIEmptyResponseExample />;
    }

    if (examples.length === 1) {
        return (
            <OpenAPIExample
                example={firstExample.example}
                context={props.context}
                syntax={syntax}
            />
        );
    }

    const tabs = examples.map((example) => {
        return {
            key: example.key,
            label: example.example.summary || example.key,
            body: (
                <OpenAPIExample example={example.example} context={props.context} syntax={syntax} />
            ),
        };
    });

    return (
        <OpenAPITabs stateKey={createStateKey('response-media-type-examples')} items={tabs}>
            <StaticSection
                header={<OpenAPITabsList />}
                className="openapi-response-media-type-examples"
            >
                <OpenAPITabsPanels />
            </StaticSection>
        </OpenAPITabs>
    );
}

/**
 * Display an example.
 */
function OpenAPIExample(props: {
    example: OpenAPIV3.ExampleObject;
    context: OpenAPIContextProps;
    syntax: string;
}) {
    const { example, context, syntax } = props;
    const code = stringifyExample({ example, xml: syntax === 'xml' });

    if (code === null) {
        return <OpenAPIEmptyResponseExample />;
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
 * Get the syntax from a media type.
 */
function getSyntaxFromMediaType(mediaType: string): string {
    if (mediaType.includes('json')) {
        return 'json';
    }

    if (mediaType === 'application/xml') {
        return 'xml';
    }

    return 'text';
}

/**
 * Get examples from a media type object.
 */
function getExamplesFromMediaTypeObject(args: {
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
                            }),
                        },
                    },
                },
            ];
        }
        return [
            {
                key: 'default',
                example: { value: generateSchemaExample(mediaTypeObject.schema) },
            },
        ];
    }
    return [];
}

/**
 * Empty response example.
 */
function OpenAPIEmptyResponseExample() {
    return (
        <pre className="openapi-response-example-empty">
            <p>No body</p>
        </pre>
    );
}

/**
 * Generate an example from a reference object.
 */
function getExampleFromReference(ref: OpenAPIV3.ReferenceObject): OpenAPIV3.ExampleObject {
    return { summary: 'Unresolved reference', value: { $ref: ref.$ref } };
}
