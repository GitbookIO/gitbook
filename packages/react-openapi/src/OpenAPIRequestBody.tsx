import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { InteractiveSection } from './InteractiveSection';
import { OpenAPIRootSchema } from './OpenAPISchemaServer';
import type { OpenAPIClientContext } from './context';
import { t } from './translate';
import type { OpenAPIOperationData, OpenAPIWebhookData } from './types';
import { checkIsReference, createStateKey } from './utils';

/**
 * Display an interactive request body.
 */
export function OpenAPIRequestBody(props: {
    requestBody: OpenAPIV3.RequestBodyObject | OpenAPIV3.ReferenceObject;
    context: OpenAPIClientContext;
    data: OpenAPIOperationData | OpenAPIWebhookData;
}) {
    const { requestBody, context, data } = props;

    if (checkIsReference(requestBody)) {
        return null;
    }

    return (
        <InteractiveSection
            header={t(context.translation, 'name' in data ? 'payload' : 'body')}
            className="openapi-requestbody"
            stateKey={createStateKey('request-body-media-type', context.blockKey)}
            selectIcon={context.icons.chevronDown}
            tabs={Object.entries(requestBody.content ?? {}).map(
                ([contentType, mediaTypeObject]) => {
                    return {
                        key: contentType,
                        label: contentType,
                        body: (
                            <OpenAPIRootSchema
                                schema={mediaTypeObject.schema ?? {}}
                                context={context}
                            />
                        ),
                    };
                }
            )}
        />
    );
}
