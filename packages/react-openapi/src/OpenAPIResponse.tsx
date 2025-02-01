import * as React from 'react';
import classNames from 'classnames';
import { OpenAPIV3 } from '@scalar/openapi-types';
import { OpenAPISchemaProperties } from './OpenAPISchema';
import { noReference } from './utils';
import { OpenAPIClientContext } from './types';
import { OpenAPIDisclosure } from './OpenAPIDisclosure';

/**
 * Display an interactive response body.
 */
export function OpenAPIResponse(props: {
    response: OpenAPIV3.ResponseObject;
    context: OpenAPIClientContext;
}) {
    const { response, context } = props;
    const content = Object.entries(response.content ?? {});
    const headers = Object.entries(response.headers ?? {}).map(
        ([name, header]) => [name, noReference(header) ?? {}] as const,
    );

    if (content.length === 0 && !response.description && headers.length === 0) {
        return null;
    }

    return (
        <div className="openapi-response-body">
            {headers.length > 0 ? (
                <OpenAPIDisclosure context={context} label={'Headers'}>
                    <OpenAPISchemaProperties
                        properties={headers.map(([name, header]) => ({
                            propertyName: name,
                            schema: noReference(header.schema) ?? {},
                            required: header.required,
                        }))}
                        context={context}
                    />
                </OpenAPIDisclosure>
            ) : null}
            {content.length > 0 ? (
                <div className={classNames('openapi-responsebody')}>
                    <OpenAPISchemaProperties
                        properties={content.map(([contentType, mediaType]) => ({
                            propertyName: mediaType.schema?.title ?? '',
                            schema: noReference(mediaType.schema) ?? {},
                            // required: mediaType.schema?.required,
                        }))}
                        context={context}
                    />
                </div>
            ) : null}
        </div>
    );
}
