import classNames from 'classnames';
import { OpenAPIV3 } from 'openapi-types';
import { OpenAPISchemaProperties, getSchemaProperties } from './OpenAPISchema';
import { noReference } from './utils';
import { OpenAPIClientContext } from './types';
import { InteractiveSection } from './InteractiveSection';

/**
 * Display an interactive response body.
 */
export function OpenAPIResponse(props: {
    response: OpenAPIV3.ResponseObject;
    context: OpenAPIClientContext;
}) {
    const { response, context } = props;
    const content = Object.entries(response.content ?? {});

    if (content.length === 0) {
        return null;
    }

    const headers = Object.entries(response.headers ?? {}).map(
        ([name, header]) => [name, noReference(header) ?? {}] as const,
    );

    return (
        <>
            {headers.length > 0 ? (
                <InteractiveSection
                    toggeable
                    defaultOpened={false}
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
            <InteractiveSection
                header="Body"
                className={classNames('openapi-responsebody')}
                tabs={content.map(([contentType, mediaType]) => {
                    return {
                        key: contentType,
                        label: contentType,
                        body: (
                            <OpenAPISchemaProperties
                                properties={
                                    getSchemaProperties(noReference(mediaType.schema) ?? {}) ?? []
                                }
                                context={context}
                            />
                        ),
                    };
                })}
            />
        </>
    );
}
