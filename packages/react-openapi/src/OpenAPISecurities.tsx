import { InteractiveSection } from './InteractiveSection';
import { Markdown } from './Markdown';
import { OpenAPISchemaName } from './OpenAPISchemaName';
import type { OpenAPIClientContext } from './context';
import { t } from './translate';
import type { OpenAPIOperationData, OpenAPISecurityWithRequired } from './types';
import { createStateKey, resolveDescription } from './utils';

/**
 * Present securities authorization that can be used for this operation.
 */
export function OpenAPISecurities(props: {
    securities: OpenAPIOperationData['securities'];
    context: OpenAPIClientContext;
}) {
    const { securities, context } = props;

    if (securities.length === 0) {
        return null;
    }

    return (
        <InteractiveSection
            header={t(context.translation, 'authorizations')}
            stateKey={createStateKey('securities', context.blockKey)}
            toggeable
            defaultOpened={false}
            toggleIcon={context.icons.chevronRight}
            selectIcon={context.icons.chevronDown}
            className="openapi-securities"
            tabs={securities.map(([key, security]) => {
                const description = resolveDescription(security);
                return {
                    key: key,
                    label: key,
                    body: (
                        <div className="openapi-schema">
                            <div className="openapi-schema-presentation">
                                {getLabelForType(security, context)}

                                {description ? (
                                    <Markdown
                                        source={description}
                                        className="openapi-securities-description"
                                    />
                                ) : null}
                            </div>
                        </div>
                    ),
                };
            })}
        />
    );
}

function getLabelForType(security: OpenAPISecurityWithRequired, context: OpenAPIClientContext) {
    switch (security.type) {
        case 'apiKey':
            return (
                <OpenAPISchemaName
                    context={context}
                    propertyName={security.name ?? 'apiKey'}
                    type="string"
                    required={security.required}
                />
            );
        case 'http':
            if (security.scheme === 'basic') {
                return (
                    <OpenAPISchemaName
                        context={context}
                        propertyName="Authorization"
                        type="string"
                        required={security.required}
                    />
                );
            }

            if (security.scheme === 'bearer') {
                const description = resolveDescription(security);
                return (
                    <>
                        <OpenAPISchemaName
                            context={context}
                            propertyName="Authorization"
                            type="string"
                            required={security.required}
                        />
                        {/** Show a default description if none is provided */}
                        {!description ? (
                            <Markdown
                                source={`Bearer authentication header of the form Bearer ${'&lt;token&gt;'}.`}
                                className="openapi-securities-description"
                            />
                        ) : null}
                    </>
                );
            }

            return (
                <OpenAPISchemaName
                    context={context}
                    propertyName="HTTP"
                    required={security.required}
                />
            );
        case 'oauth2':
            return (
                <OpenAPISchemaName
                    context={context}
                    propertyName="OAuth2"
                    required={security.required}
                />
            );
        case 'openIdConnect':
            return (
                <OpenAPISchemaName
                    context={context}
                    propertyName="OpenID Connect"
                    required={security.required}
                />
            );
        default:
            // @ts-ignore
            return security.type;
    }
}
