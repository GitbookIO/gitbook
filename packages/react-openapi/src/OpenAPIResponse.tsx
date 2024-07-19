import * as React from 'react';
import classNames from 'classnames';
import { OpenAPIV3 } from 'openapi-types';
import { OpenAPIRootSchema, OpenAPISchemaProperties } from './OpenAPISchema';
import { noReference } from './utils';
import { OpenAPIClientContext } from './types';
import { InteractiveSection } from './InteractiveSection';
import { Markdown } from './Markdown';

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
        <>
            {response.description ? (
                <Markdown source={response.description} className="openapi-response-description" />
            ) : null}

            {headers.length > 0 ? (
                <InteractiveSection
                    toggeable
                    defaultOpened={!!context.defaultInteractiveOpened}
                    toggleCloseIcon={context.icons.chevronDown}
                    toggleOpenIcon={context.icons.chevronRight}
                    header="Headers"
                    className={classNames('openapi-responseheaders')}
                >
                    <OpenAPISchemaProperties
                        properties={headers.map(([name, header]) => ({
                            propertyName: name,
                            schema: noReference(header.schema) ?? {},
                            required: header.required,
                        }))}
                        context={context}
                    />
                </InteractiveSection>
            ) : null}
            {content.length > 0 ? (
                <InteractiveSection
                    header="Body"
                    className={classNames('openapi-responsebody')}
                    tabs={content.map(([contentType, mediaType]) => {
                        return {
                            key: contentType,
                            label: contentType,
                            body: (
                                <OpenAPIRootSchema
                                    schema={noReference(mediaType.schema) ?? {}}
                                    context={context}
                                />
                            ),
                        };
                    })}
                />
            ) : null}
        </>
    );
}
