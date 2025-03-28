import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { OpenAPIDisclosure } from './OpenAPIDisclosure';
import { OpenAPISchemaProperties } from './OpenAPISchemaServer';
import type { OpenAPIClientContext } from './types';
import { parameterToProperty, resolveDescription } from './utils';

/**
 * Display an interactive response body.
 */
export function OpenAPIResponse(props: {
    response: OpenAPIV3.ResponseObject;
    mediaType: OpenAPIV3.MediaTypeObject;
    context: OpenAPIClientContext;
}) {
    const { response, context, mediaType } = props;
    const headers = Object.entries(response.headers ?? {}).map(
        ([name, header]) => [name, header ?? {}] as const
    );
    const content = Object.entries(mediaType.schema ?? {});

    const description = resolveDescription(response);

    if (content.length === 0 && !description && headers.length === 0) {
        return null;
    }

    return (
        <div className="openapi-response-body">
            {headers.length > 0 ? (
                <OpenAPIDisclosure context={context} label="Headers">
                    <OpenAPISchemaProperties
                        properties={headers.map(([name, header]) =>
                            parameterToProperty({ name, ...header })
                        )}
                        context={context}
                    />
                </OpenAPIDisclosure>
            ) : null}
            <div className="openapi-responsebody">
                <OpenAPISchemaProperties
                    id={`response-${context.blockKey}`}
                    properties={mediaType.schema ? [{ schema: mediaType.schema }] : []}
                    context={context}
                />
            </div>
        </div>
    );
}
