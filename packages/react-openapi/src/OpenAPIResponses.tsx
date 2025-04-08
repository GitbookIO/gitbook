import type { OpenAPIV3, OpenAPIV3_1 } from '@gitbook/openapi-parser';
import clsx from 'clsx';
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
                                    <span
                                        className={clsx(
                                            'openapi-response-statuscode',
                                            `openapi-response-statuscode-${getStatusCodeClassName(statusCode)}`
                                        )}
                                    >
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

/**
 * Get the class name for a status code.
 * 1xx: informational
 * 2xx: success
 * 3xx: redirect
 * 4xx, 5xx: error
 */
function getStatusCodeClassName(statusCode: number | string): string {
    const code = typeof statusCode === 'string' ? Number.parseInt(statusCode, 10) : statusCode;

    if (Number.isNaN(code) || code < 100 || code >= 600) {
        return 'unknown';
    }

    // Determine the category of the status code based on the first digit
    const category = Math.floor(code / 100);

    switch (category) {
        case 1:
            return 'informational';
        case 2:
            return 'success';
        case 3:
            return 'redirect';
        case 4:
        case 5:
            return 'error';
        default:
            return 'unknown';
    }
}
