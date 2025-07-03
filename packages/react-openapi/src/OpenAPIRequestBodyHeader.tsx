'use client';

import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { useSelectState } from './OpenAPISelect';
import type { OpenAPIClientContext } from './context';
import { t } from './translate';
import type { OpenAPIOperationData, OpenAPIWebhookData } from './types';
import { getSchemaTitle } from './utils';

/**
 * Header component for the request body.
 * It displays the name of the request body and the type of the request body.
 */
export function OpenAPIRequestBodyHeader(props: {
    requestBody: OpenAPIV3.RequestBodyObject;
    context: OpenAPIClientContext;
    data: OpenAPIOperationData | OpenAPIWebhookData;
    stateKey: string;
}) {
    const contents = Object.entries(props.requestBody.content ?? {});

    return (
        <>
            <span>{t(props.context.translation, 'name' in props.data ? 'payload' : 'body')}</span>
            {contents.length ? <OpenAPIRequestBodyHeaderContent {...props} /> : null}
        </>
    );
}

/**
 * Display the type of a request body.
 */
function OpenAPIRequestBodyHeaderContent(props: {
    requestBody: OpenAPIV3.RequestBodyObject;
    stateKey: string;
}) {
    const { requestBody, stateKey } = props;
    const contentKeys = Object.keys(requestBody.content ?? {});
    const state = useSelectState(stateKey, contentKeys[0]);

    const selectedContentMediaType = Object.entries(requestBody.content ?? {}).find(
        ([contentType]) => contentType === state.key
    )?.[1];

    // If the selected content is not an array, we don't display the type
    if (
        !selectedContentMediaType ||
        !selectedContentMediaType.schema?.type ||
        selectedContentMediaType.schema.type !== 'array'
    ) {
        return null;
    }

    return (
        <span className="openapi-requestbody-header-type">
            {`${getSchemaTitle(selectedContentMediaType.schema)}`}
        </span>
    );
}
