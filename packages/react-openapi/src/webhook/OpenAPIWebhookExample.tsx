import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { OpenAPIEmptyExample, OpenAPIExample, getExampleFromSchema } from '../OpenAPIExample';
import type { OpenAPIContext } from '../types';
import type { OpenAPIWebhookData } from '../types';
import { getSyntaxFromMediaType } from '../utils';
import { OpenAPIResponseMediaTypeContent } from './OpenAPIWebhookExampleContent';

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
            operation.requestBody.content as Record<string, OpenAPIV3.MediaTypeObject>
        ).map(([key, value]) => {
            const schema = value.schema;
            const syntax = getSyntaxFromMediaType(key);

            if (!schema) {
                return {
                    key,
                    label: key,
                    body: <OpenAPIEmptyExample />,
                };
            }

            return {
                key,
                label: key,
                body: (
                    <OpenAPIExample
                        context={context}
                        example={getExampleFromSchema({ schema })}
                        syntax={syntax}
                    />
                ),
            };
        });
    })();

    return (
        <div className="openapi-panel">
            <h4 className="openapi-panel-heading">Payload</h4>
            <div className="openapi-panel-body">
                <OpenAPIResponseMediaTypeContent
                    items={items}
                    selectIcon={context.icons.chevronDown}
                    blockKey={context.blockKey}
                />
            </div>
        </div>
    );
}
