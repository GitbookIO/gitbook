import * as React from 'react';
import classNames from 'classnames';
import { OpenAPIV3 } from 'openapi-types';
import { noReference } from './utils';
import { OpenAPIResponse } from './OpenAPIResponse';
import { OpenAPIClientContext } from './types';
import { InteractiveSection } from './InteractiveSection';

/**
 * Display an interactive response body.
 */
export function OpenAPIResponses(props: {
    responses: OpenAPIV3.ResponsesObject;
    context: OpenAPIClientContext;
}) {
    const { responses, context } = props;

    return (
        <InteractiveSection
            stateKey={`${context.blockKey}_response`}
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
