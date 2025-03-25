import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { InteractiveSection } from './InteractiveSection';
import { OpenAPIRootSchema } from './OpenAPISchemaServer';
import type { OpenAPIClientContext } from './types';
import { checkIsReference } from './utils';

/**
 * Display an interactive request body.
 */
export function OpenAPIRequestBody(props: {
    requestBody: OpenAPIV3.RequestBodyObject | OpenAPIV3.ReferenceObject;
    context: OpenAPIClientContext;
}) {
    const { requestBody, context } = props;

    if (checkIsReference(requestBody)) {
        return null;
    }

    return (
        <InteractiveSection
            header="Body"
            className="openapi-requestbody"
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
