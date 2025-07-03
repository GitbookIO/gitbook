import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { OpenAPIDisclosure } from './OpenAPIDisclosure';
import { OpenAPISchemaPresentation } from './OpenAPISchema';
import { OpenAPISchemaProperties } from './OpenAPISchemaServer';
import type { OpenAPIClientContext } from './context';
import { tString } from './translate';
import { parameterToProperty, resolveDescription } from './utils';

/**
 * Display an interactive response body.
 */
export function OpenAPIResponse(props: {
    response: OpenAPIV3.ResponseObject;
    mediaType: OpenAPIV3.MediaTypeObject | null;
    context: OpenAPIClientContext;
}) {
    const { response, context, mediaType } = props;
    const headers = Object.entries(response.headers ?? {}).map(
        ([name, header]) => [name, header ?? {}] as const
    );
    const content = Object.entries(mediaType?.schema ?? {});

    const description = resolveDescription(response);

    if (content.length === 0 && !description && headers.length === 0) {
        return null;
    }

    return (
        <div className="openapi-response-body">
            {headers.length > 0 ? (
                <OpenAPIDisclosure
                    header={
                        <OpenAPISchemaPresentation
                            context={context}
                            property={{
                                propertyName: tString(context.translation, 'headers'),
                                schema: {
                                    type: 'object',
                                },
                                required: null,
                            }}
                        />
                    }
                    icon={context.icons.plus}
                    label={(isExpanded) =>
                        tString(
                            context.translation,
                            isExpanded ? 'hide' : 'show',
                            tString(
                                context.translation,
                                headers.length === 1 ? 'header' : 'headers'
                            )
                        )
                    }
                >
                    <OpenAPISchemaProperties
                        properties={headers.map(([name, header]) =>
                            parameterToProperty({ name, ...header })
                        )}
                        context={context}
                    />
                </OpenAPIDisclosure>
            ) : null}
            {mediaType?.schema && (
                <div className="openapi-responsebody">
                    <OpenAPISchemaProperties
                        id={`response-${context.blockKey}`}
                        properties={[
                            {
                                schema: mediaType.schema,
                                propertyName: tString(context.translation, 'response'),
                                required: null,
                            },
                        ]}
                        context={context}
                    />
                </div>
            )}
        </div>
    );
}
