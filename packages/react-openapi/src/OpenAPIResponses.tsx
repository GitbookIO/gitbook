import * as React from 'react';
import classNames from 'classnames';
import { createStateKey, noReference } from './utils';
import { OpenAPIResponse } from './OpenAPIResponse';
import { OpenAPIClientContext } from './types';
import { InteractiveSection } from './InteractiveSection';
import { OpenAPIV3, OpenAPIV3_1 } from '@scalar/openapi-types';
import { OpenAPIDisclosureGroup } from './OpenAPIDisclosureGroup';
import { Markdown } from './Markdown';
import { OpenAPIRootSchema, OpenAPISchemaProperties, OpenAPISchemaProperty } from './OpenAPISchema';
import { OpenAPIDisclosure } from './OpenAPIDisclosure';

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
                allowsMultipleExpanded
                icon={context.icons.chevronRight}
                groups={Object.entries(responses).map(
                    ([statusCode, response]: [string, OpenAPIV3.ResponseObject]) => {
                        const content = Object.entries(response.content ?? {});
                        const headers = Object.entries(response.headers ?? {}).map(
                            ([name, header]) => [name, noReference(header) ?? {}] as const,
                        );

                        return {
                            id: statusCode,
                            label: (
                                <div
                                    className="openapi-response-tab-content"
                                    key={`response-${statusCode}`}
                                >
                                    <span className="openapi-response-statuscode">
                                        {statusCode}
                                    </span>
                                    {response.description ? (
                                        <Markdown
                                            source={response.description}
                                            className="openapi-response-description"
                                        />
                                    ) : null}
                                </div>
                            ),
                            tabs: content.map(([contentType, mediaType]) => ({
                                id: contentType,
                                label: contentType,
                                body: (
                                    <OpenAPIResponse
                                        response={response}
                                        mediaType={mediaType}
                                        context={context}
                                    />
                                ),
                            })),
                        };
                    },
                )}
            />
        </InteractiveSection>
    );
}
