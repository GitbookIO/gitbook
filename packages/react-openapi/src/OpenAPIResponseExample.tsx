import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { Markdown } from './Markdown';
import {
    OpenAPIEmptyExample,
    OpenAPIExample,
    getExampleFromReference,
    getExamplesFromMediaTypeObject,
} from './OpenAPIExample';
import { OpenAPIResponseExampleContent } from './OpenAPIResponseExampleContent';
import { OpenAPIResponseMediaTypeContent } from './OpenAPIResponseMediaType';
import type { OpenAPIContext, OpenAPIOperationData } from './types';
import { checkIsReference, resolveDescription } from './utils';

/**
 * Display an example of the response content.
 */
export function OpenAPIResponseExample(props: {
    data: OpenAPIOperationData;
    context: OpenAPIContext;
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
                label: description ? <Markdown source={description} /> : null,
                statusCode: key,
                body: (
                    <OpenAPIExample
                        example={getExampleFromReference(responseObject)}
                        context={context}
                        syntax="json"
                    />
                ),
            };
        }

        if (!responseObject.content || Object.keys(responseObject.content).length === 0) {
            return {
                key: key,
                label: description ? <Markdown source={description} /> : null,
                statusCode: key,
                body: <OpenAPIEmptyExample />,
            };
        }

        return {
            key: key,
            label: description ? <Markdown source={description} /> : null,
            statusCode: key,
            body: <OpenAPIResponse context={context} content={responseObject.content} />,
        };
    });

    if (tabs.length === 0) {
        return null;
    }

    return <OpenAPIResponseExampleContent blockKey={context.blockKey} items={tabs} />;
}

function OpenAPIResponse(props: {
    context: OpenAPIContext;
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

    return <OpenAPIResponseMediaTypeContent blockKey={context.blockKey} items={tabs} />;
}

function OpenAPIResponseMediaType(props: {
    mediaTypeObject: OpenAPIV3.MediaTypeObject;
    mediaType: string;
    context: OpenAPIContext;
}) {
    const { mediaTypeObject, mediaType } = props;
    const examples = getExamplesFromMediaTypeObject({ mediaTypeObject, mediaType });
    const syntax = getSyntaxFromMediaType(mediaType);
    const firstExample = examples[0];

    if (!firstExample) {
        return <OpenAPIEmptyExample />;
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

    return <OpenAPIResponseMediaTypeContent blockKey={props.context.blockKey} items={tabs} />;
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
