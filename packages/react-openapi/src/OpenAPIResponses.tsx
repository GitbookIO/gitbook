import * as React from 'react';
import classNames from 'classnames';
import { createStateKey, noReference } from './utils';
import { OpenAPIResponse } from './OpenAPIResponse';
import { OpenAPIClientContext } from './types';
import { InteractiveSection } from './InteractiveSection';
import { OpenAPIV3, OpenAPIV3_1 } from '@scalar/openapi-types';
import { OpenAPIDisclosureGroup } from './OpenAPIDisclosure';
import { Markdown } from './Markdown';
import { OpenAPIRootSchema } from './OpenAPISchema';

/**
 * Display an interactive response body.
 */
export function OpenAPIResponses(props: {
    responses: OpenAPIV3.ResponsesObject | OpenAPIV3_1.ResponsesObject;
    context: OpenAPIClientContext;
}) {
    const { responses, context } = props;

    return (
        <InteractiveSection
            stateKey={createStateKey('response', context.blockKey)}
            header="Responses"
            className={classNames('openapi-responses')}
        >
            <OpenAPIDisclosureGroup
                icon={context.icons.chevronRight}
                groups={Object.entries(responses).map(
                    ([statusCode, response]: [string, OpenAPIV3.ResponseObject]) => {
                        const content = Object.entries(response.content ?? {});

                        return {
                            key: statusCode,
                            label: (
                                <>
                                    <span className="openapi-response-statuscode">
                                        {statusCode}
                                    </span>
                                    {response.description ? (
                                        <Markdown
                                            source={response.description}
                                            className="openapi-response-description"
                                        />
                                    ) : null}

                                    {content.length
                                        ? content.map(([contentType, mediaType]) => (
                                              <span className="openapi-response-content-type">
                                                  {contentType}
                                              </span>
                                          ))
                                        : null}
                                </>
                            ),
                            body: <OpenAPIResponse response={response} context={context} />,
                        };
                    },
                )}
            />
        </InteractiveSection>
    );
}
