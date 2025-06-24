import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { OpenAPIEmptyExample } from './OpenAPIExample';
import { OpenAPIMediaTypeContent } from './OpenAPIMediaType';
import { type OpenAPIContext, getOpenAPIClientContext } from './context';
import type { OpenAPIWebhookData } from './types';
import { getExamples } from './util/example';
import { createStateKey } from './utils';

export function OpenAPIWebhookExample(props: {
    data: OpenAPIWebhookData;
    context: OpenAPIContext;
}) {
    const { data, context } = props;
    const { operation } = data;

    const items = (() => {
        if (!operation.requestBody) {
            return [];
        }

        return Object.entries(
            operation.requestBody.content as Record<string, OpenAPIV3.MediaTypeObject | null>
        ).map(([key, value]) => {
            const schema = value?.schema;

            if (!schema) {
                return {
                    key,
                    label: key,
                    body: <OpenAPIEmptyExample context={context} />,
                };
            }

            return {
                key,
                label: key,
                body: <></>,
                examples: getExamples({
                    mediaTypeObject: value,
                    mediaType: key,
                    context,
                }),
            };
        });
    })();

    return (
        <div className="openapi-panel">
            <h4 className="openapi-panel-heading">Payload</h4>
            <div className="openapi-panel-body">
                <OpenAPIMediaTypeContent
                    selectIcon={context.icons.chevronDown}
                    stateKey={createStateKey('request-body-media-type', context.blockKey)}
                    items={items}
                    context={getOpenAPIClientContext(context)}
                />
            </div>
        </div>
    );
}
