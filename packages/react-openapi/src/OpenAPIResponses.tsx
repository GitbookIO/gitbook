import type { OpenAPIV3, OpenAPIV3_1 } from '@gitbook/openapi-parser';
import { resolveDescription } from './utils';
import { OpenAPIResponse } from './OpenAPIResponse';
import { OpenAPIClientContext } from './types';
import { InteractiveSection } from './InteractiveSection';
import { OpenAPIDisclosureGroup } from './OpenAPIDisclosureGroup';

/**
 * Display an interactive response body.
 */
export function OpenAPIResponses(props: {
    responses: OpenAPIV3.ResponsesObject | OpenAPIV3_1.ResponsesObject;
    context: OpenAPIClientContext;
}) {
    const { responses, context } = props;

    return (
        <InteractiveSection header="Responses" className="openapi-responses">
            <OpenAPIDisclosureGroup
                allowsMultipleExpanded
                icon={context.icons.chevronRight}
                groups={Object.entries(responses).map(
                    ([statusCode, response]: [string, OpenAPIV3.ResponseObject]) => {
                        const content = Object.entries(response.content ?? {});
                        const description = resolveDescription(response);

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
                                    {description ? (
                                        <div className="openapi-markdown openapi-response-description">
                                            {htmlToText(description)}
                                        </div>
                                    ) : null}
                                </div>
                            ),
                            tabs: content.map(([contentType, mediaType]) => ({
                                id: contentType,
                                label: contentType,
                                body: (
                                    <OpenAPIResponse
                                        key={`$response-${statusCode}-${contentType}`}
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

function htmlToText(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent?.trim() || '';
}
