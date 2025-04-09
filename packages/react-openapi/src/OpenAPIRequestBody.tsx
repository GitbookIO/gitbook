import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { InteractiveSection } from './InteractiveSection';
import { OpenAPIRootSchema } from './OpenAPISchemaServer';
import type { OpenAPIClientContext, OpenAPIOperationData } from './types';
import { checkIsReference } from './utils';

/**
 * Display an interactive request body.
 */
export function OpenAPIRequestBody(props: {
    requestBody: OpenAPIV3.RequestBodyObject | OpenAPIV3.ReferenceObject;
    context: OpenAPIClientContext;
    data: OpenAPIOperationData;
}) {
    const { requestBody, context, data } = props;
    const { method, path } = data;

    if (checkIsReference(requestBody)) {
        return null;
    }

    return (
        <InteractiveSection
            header="Body"
            className="openapi-requestbody"
            stateKey={`media-type-${method}-${path}`}
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
