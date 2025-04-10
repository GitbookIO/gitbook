import type { OpenAPIV3, OpenAPIV3_1 } from '@gitbook/openapi-parser';
import { Markdown } from './Markdown';
import { OpenAPIDisclosureGroup } from './OpenAPIDisclosureGroup';
import { OpenAPIResponse } from './OpenAPIResponse';
import { StaticSection } from './StaticSection';
import type { OpenAPIClientContext } from './types';

/**
 * Display an interactive response body.
 */
export function OpenAPIResponses(props: {
    responses: OpenAPIV3.ResponsesObject | OpenAPIV3_1.ResponsesObject;
    context: OpenAPIClientContext;
}) {
    const { responses, context } = props;

    return (
        <StaticSection header="Responses" className="openapi-responses">
            <OpenAPIDisclosureGroup
                allowsMultipleExpanded
                icon={context.icons.chevronRight}
                groups={Object.entries(responses).map(
                    ([statusCode, response]: [string, OpenAPIV3.ResponseObject]) => {
                        const tabs = (() => {
                            // If there is no content, but there are headers, we need to show the headers
                            if (
                                (!response.content || !Object.keys(response.content).length) &&
                                response.headers &&
                                Object.keys(response.headers).length
                            ) {
                                return [
                                    {
                                        id: 'default',
                                        body: (
                                            <OpenAPIResponse
                                                response={response}
                                                mediaType={{}}
                                                context={context}
                                            />
                                        ),
                                    },
                                ];
                            }

                            return Object.entries(response.content ?? {}).map(
                                ([contentType, mediaType]) => ({
                                    id: contentType,
                                    label: contentType,
                                    body: (
                                        <OpenAPIResponse
                                            response={response}
                                            mediaType={mediaType}
                                            context={context}
                                        />
                                    ),
                                })
                            );
                        })();

                        const description = response.description;

                        return {
                            id: statusCode,
                            label: (
                                <div className="openapi-response-tab-content">
                                    <span className="openapi-response-statuscode">
                                        {statusCode}
                                    </span>
                                    {description ? (
                                        <Markdown
                                            source={description}
                                            className="openapi-response-description"
                                        />
                                    ) : null}
                                </div>
                            ),
                            tabs,
                        };
                    }
                )}
            />
        </StaticSection>
    );
}
