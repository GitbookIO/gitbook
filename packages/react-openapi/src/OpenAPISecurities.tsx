import { InteractiveSection } from './InteractiveSection';
import { Markdown } from './Markdown';
import { OpenAPISchemaName } from './OpenAPISchemaName';
import type {
    OpenAPIClientContext,
    OpenAPIOperationData,
    OpenAPISecurityWithRequired,
} from './types';
import { resolveDescription } from './utils';

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
            header="Authorizations"
            toggeable
            defaultOpened={false}
            toggleIcon={context.icons.chevronRight}
            className="openapi-securities"
            tabs={securities.map(([key, security]) => {
                const description = resolveDescription(security);
                return {
                    key: key,
                    label: key,
                    body: (
                        <div className="openapi-schema">
                            <div className="openapi-schema-presentation">
                                {getLabelForType(security)}

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

function getLabelForType(security: OpenAPISecurityWithRequired) {
    switch (security.type) {
        case 'apiKey':
            return (
                <OpenAPISchemaName
                    propertyName={security.name ?? 'apiKey'}
                    type="string"
                    required={security.required}
                />
            );
        case 'http':
            if (security.scheme === 'basic') {
                return (
                    <OpenAPISchemaName
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

            return <OpenAPISchemaName propertyName="HTTP" required={security.required} />;
        case 'oauth2':
            return <OpenAPISchemaName propertyName="OAuth2" required={security.required} />;
        case 'openIdConnect':
            return <OpenAPISchemaName propertyName="OpenID Connect" required={security.required} />;
        default:
            // @ts-ignore
            return security.type;
    }
}
