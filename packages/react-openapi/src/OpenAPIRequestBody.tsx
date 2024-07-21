import * as React from 'react';

import { OpenAPIV3 } from 'openapi-types';
import { OpenAPIRootSchema } from './OpenAPISchema';
import { noReference } from './utils';
import { OpenAPIClientContext } from './types';
import { InteractiveSection } from './InteractiveSection';
import { Markdown } from './Markdown';

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
            defaultOpened={context.defaultInteractiveOpened}
        >
            {requestBody.description ? (
                <Markdown
                    source={requestBody.description}
                    className="openapi-requestbody-description"
                />
            ) : null}
        </InteractiveSection>
    );
}
