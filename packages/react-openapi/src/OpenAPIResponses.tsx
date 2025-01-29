import * as React from 'react';
import classNames from 'classnames';
import { createStateKey, noReference } from './utils';
import { OpenAPIResponse } from './OpenAPIResponse';
import { OpenAPIClientContext } from './types';
import { InteractiveSection } from './InteractiveSection';
import { OpenAPIV3, OpenAPIV2, OpenAPIV3_1 } from '@scalar/openapi-types';

/**
 * Display an interactive response body.
 */
export function OpenAPIResponses(props: {
    responses: OpenAPIV2.ResponsesObject | OpenAPIV3.ResponsesObject | OpenAPIV3_1.ResponsesObject;
    context: OpenAPIClientContext;
}) {
    const { responses, context } = props;

    return (
        <InteractiveSection
            stateKey={createStateKey('response', context.blockKey)}
            header="Response"
            className={classNames('openapi-responses')}
            tabs={Object.entries(responses).map(([statusCode, response]) => {
                return {
                    key: statusCode,
                    label: statusCode,
                    body: <OpenAPIResponse response={noReference(response)} context={context} />,
                };
            })}
        />
    );
}
