import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { Markdown } from './Markdown';
import { OpenAPIEmptyExample, OpenAPIExample } from './OpenAPIExample';
import { OpenAPIMediaTypeContent } from './OpenAPIMediaType';
import { OpenAPIResponseExampleContent } from './OpenAPIResponseExampleContent';
import type { OpenAPIContext, OpenAPIOperationData, OpenAPIWebhookData } from './types';
import { getExampleFromReference, getExamples } from './util/example';
import { createStateKey, getStatusCodeDefaultLabel } from './utils';
import { checkIsReference, resolveDescription } from './utils';

/**
 * Display an example of the response content.
 */
export function OpenAPIResponseExample(props: {
    data: OpenAPIOperationData | OpenAPIWebhookData;
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
        const label = description ? (
            <Markdown source={description} />
        ) : (
            getStatusCodeDefaultLabel(key)
        );

        if (checkIsReference(responseObject)) {
            return {
                key: key,
                label,
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
                label,
                statusCode: key,
                body: <OpenAPIEmptyExample />,
            };
        }

        return {
            key: key,
            label,
            statusCode: key,
            body: <OpenAPIResponse context={context} content={responseObject.content} />,
        };
    });

    if (tabs.length === 0) {
        return null;
    }

    return (
        <OpenAPIResponseExampleContent
            selectIcon={context.icons.chevronDown}
            blockKey={context.blockKey}
            items={tabs}
        />
    );
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

    const tabs = entries.map((entry) => {
        const [mediaType, mediaTypeObject] = entry;
        return {
            key: mediaType,
            label: mediaType,
            body: <></>,
            examples: getExamples({
                mediaTypeObject,
                mediaType,
                context,
            }),
        };
    });

    return (
        <OpenAPIMediaTypeContent
            selectIcon={context.icons.chevronDown}
            stateKey={createStateKey('response-media-types', context.blockKey)}
            items={tabs}
        />
    );
}
