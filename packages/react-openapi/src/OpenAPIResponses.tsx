'use client';

import type { OpenAPIV3, OpenAPIV3_1 } from '@gitbook/openapi-parser';
import clsx from 'clsx';
import { Markdown } from './Markdown';
import { OpenAPIDisclosureGroup } from './OpenAPIDisclosureGroup';
import { OpenAPIResponse } from './OpenAPIResponse';
import { useResponseExamplesState } from './OpenAPIResponseExampleContent';
import { StaticSection } from './StaticSection';
import type { OpenAPIClientContext } from './context';
import { t } from './translate';
import {
    createStateKey,
    getStatusCodeClassName,
    getStatusCodeDefaultLabel,
    resolveDescription,
} from './utils';

/**
 * Display an interactive response body.
 */
export function OpenAPIResponses(props: {
    responses: OpenAPIV3.ResponsesObject | OpenAPIV3_1.ResponsesObject;
    context: OpenAPIClientContext;
}) {
    const { responses, context } = props;

    const groups = Object.entries(responses)
        .filter(([_, response]) => response && typeof response === 'object')
        .map(([statusCode, response]: [string, OpenAPIV3.ResponseObject]) => {
            const tabs = (() => {
                // If there is no content, but there are headers, we need to show the headers
                if (
                    (!response.content || !Object.keys(response.content).length) &&
                    response.headers &&
                    Object.keys(response.headers).length
                ) {
                    return [
                        {
                            key: 'default',
                            label: '',
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

                if (!response.content) {
                    return [
                        {
                            key: 'default',
                            label: '',
                            body: (
                                <pre className="openapi-example-empty">
                                    <p>{t(context.translation, 'no_content')}</p>
                                </pre>
                            ),
                        },
                    ];
                }

                return Object.entries(response.content ?? {}).map(([contentType, mediaType]) => ({
                    key: contentType,
                    label: contentType,
                    body: (
                        <OpenAPIResponse
                            response={response}
                            mediaType={mediaType}
                            context={context}
                        />
                    ),
                }));
            })();

            const description = resolveDescription(response);

            return {
                key: statusCode,
                label: (
                    <div className="openapi-response-tab-content">
                        <span
                            className={clsx(
                                'openapi-statuscode',
                                `openapi-statuscode-${getStatusCodeClassName(statusCode)}`
                            )}
                        >
                            {statusCode}
                        </span>
                        {description ? (
                            <Markdown
                                source={description}
                                className="openapi-response-description"
                            />
                        ) : (
                            getStatusCodeDefaultLabel(statusCode, context)
                        )}
                    </div>
                ),
                tabs,
            };
        });

    const state = useResponseExamplesState(context.blockKey, groups[0]?.key);

    return (
        <StaticSection header={t(context.translation, 'responses')} className="openapi-responses">
            <OpenAPIDisclosureGroup
                icon={context.icons.chevronRight}
                expandedKeys={state.key ? new Set([state.key]) : new Set()}
                onExpandedChange={(keys) => {
                    const key = keys.values().next().value ?? null;
                    state.setKey(key);
                }}
                groups={groups}
                selectIcon={context.icons.chevronDown}
                selectStateKey={createStateKey('response-media-types', context.blockKey)}
            />
        </StaticSection>
    );
}
