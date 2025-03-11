import type { OpenAPIV3_1 } from '@gitbook/openapi-parser';
import { InteractiveSection } from './InteractiveSection';
import { Markdown } from './Markdown';
import { OpenAPISchemaName } from './OpenAPISchemaName';
import type { OpenAPIClientContext, OpenAPIOperationData } from './types';
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

function getLabelForType(security: OpenAPIV3_1.SecuritySchemeObject) {
    switch (security.type) {
        case 'apiKey':
            return (
                <OpenAPISchemaName
                    propertyName={security.name ?? 'apiKey'}
                    type="string"
                    required
                />
            );
        case 'http':
            if (security.scheme === 'basic') {
                return <OpenAPISchemaName propertyName="Authorization" type="string" required />;
            }

            if (security.scheme === 'bearer') {
                const description = resolveDescription(security);
                return (
                    <>
                        <OpenAPISchemaName propertyName="Authorization" type="string" required />
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

            return <OpenAPISchemaName propertyName="HTTP" required />;
        case 'oauth2':
            return <OpenAPISchemaName propertyName="OAuth2" required />;
        case 'openIdConnect':
            return <OpenAPISchemaName propertyName="OpenID Connect" required />;
        default:
            // @ts-ignore
            return security.type;
    }
}
