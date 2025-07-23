'use client';

import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { useSelectState } from './OpenAPISelect';
import { getSchemaTitle } from './utils';

/**
 * Display the type of a request body. It only displays the type if the selected content is an array.
 */
export function OpenAPIRequestBodyHeaderType(props: {
    requestBody: OpenAPIV3.RequestBodyObject;
    stateKey: string;
}) {
    const { requestBody, stateKey } = props;
    const content = requestBody.content ?? {};
    const state = useSelectState(stateKey, Object.keys(content)[0]);

    const selectedContentMediaType = Object.entries(content).find(
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
