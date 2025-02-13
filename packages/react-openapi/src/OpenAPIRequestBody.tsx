import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { OpenAPIRootSchema } from './OpenAPISchema';
import { noReference } from './utils';
import type { OpenAPIClientContext } from './types';
import { InteractiveSection } from './InteractiveSection';

/**
 * Display an interactive request body.
 */
export function OpenAPIRequestBody(props: {
    requestBody: OpenAPIV3.RequestBodyObject;
    context: OpenAPIClientContext;
}) {
    const { requestBody, context } = props;

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
                                schema={noReference(mediaTypeObject.schema) ?? {}}
                                context={context}
                            />
                        ),
                    };
                },
            )}
        />
    );
}
