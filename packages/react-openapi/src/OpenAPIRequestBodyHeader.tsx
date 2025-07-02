'use client';

import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { getSchemaTitle } from './OpenAPISchema';
import { useSelectState } from './OpenAPISelect';
import type { OpenAPIClientContext } from './context';
import { t } from './translate';
import type { OpenAPIOperationData, OpenAPIWebhookData } from './types';

/**
 * Display the header of a request body.
 */
export function OpenAPIRequestBodyHeader(props: {
    requestBody: OpenAPIV3.RequestBodyObject;
    context: OpenAPIClientContext;
    data: OpenAPIOperationData | OpenAPIWebhookData;
    stateKey: string;
}) {
    const { requestBody, context, data, stateKey } = props;
    const state = useSelectState(stateKey, context.blockKey);

    const [, selectedContentMediaType] =
        Object.entries(requestBody.content ?? {}).find(
            ([contentType]) => contentType === state.key
        ) ?? [];

    return (
        <>
            <span>{t(context.translation, 'name' in data ? 'payload' : 'body')}</span>

            {/** If the selected content is an array, We display the type next to the label */}
            {selectedContentMediaType?.schema?.type === 'array' ? (
                <span className="openapi-requestbody-header-type">
                    {`${getSchemaTitle(selectedContentMediaType.schema)}`}
                </span>
            ) : null}
        </>
    );
}
