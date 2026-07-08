'use client';

import type { OpenAPIV3, OpenAPIV3_1 } from '@gitbook/openapi-parser';
import clsx from 'classnames';
import type { Key } from 'react-aria';
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

    const state = useResponseExamplesState(groups[0]?.key);

    const expandAll = context.expandAllResponses;

    // In expand-all mode the group manages its own (multiple) expanded rows; otherwise it's
    // controlled and stays in sync with the page-wide responses selector.
    const disclosureProps = expandAll
        ? {
              stateKey: createStateKey('openapi-responses-disclosure', context.blockKey),
              defaultExpandedKeys: groups.map((g) => g.key),
          }
        : {
              expandedKeys: getExpandedResponseKeys(groups, state.key),
              onExpandedChange: (keys: Set<Key>) => {
                  state.setKey(keys.values().next().value ?? null);
              },
          };

    return (
        <StaticSection header={t(context.translation, 'responses')} className="openapi-responses">
            <OpenAPIDisclosureGroup
                icon={context.icons.chevronRight}
                allowsMultipleExpanded={expandAll}
                groups={groups}
                selectIcon={context.icons.chevronDown}
                selectStateKey={createStateKey('response-media-types', context.blockKey)}
                {...disclosureProps}
            />
        </StaticSection>
    );
}

/**
 * Resolve the expanded response for the controlled accordion: nothing when the selection is
 * cleared, otherwise the selected status code, falling back to the first response when this
 * operation doesn't define it.
 */
function getExpandedResponseKeys(groups: { key: string }[], selectedKey: Key | null): Set<string> {
    if (selectedKey == null) {
        return new Set<string>();
    }
    const key = groups.find((g) => g.key === selectedKey)?.key ?? groups[0]?.key;
    return key ? new Set([key]) : new Set<string>();
}
