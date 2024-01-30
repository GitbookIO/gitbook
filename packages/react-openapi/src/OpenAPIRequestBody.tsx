import { OpenAPIV3 } from 'openapi-types';
import { OpenAPISchemaProperties, getSchemaProperties } from './OpenAPISchema';
import { noReference } from './utils';
import { OpenAPIClientContext } from './types';
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
                            <OpenAPISchemaProperties
                                properties={
                                    getSchemaProperties(
                                        noReference(mediaTypeObject.schema) ?? {},
                                    ) ?? []
                                }
                                context={context}
                            />
                        ),
                    };
                },
            )}
        />
    );
}
