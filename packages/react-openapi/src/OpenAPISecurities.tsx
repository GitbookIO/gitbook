import * as React from 'react';
import { OpenAPIV3_1 } from '@scalar/openapi-types';
import { OpenAPIClientContext } from './types';
import { InteractiveSection } from './InteractiveSection';
import { Markdown } from './Markdown';
import { OpenAPIOperationData } from './fetchOpenAPIOperation';
import { OpenAPISchemaName } from './OpenAPISchemaName';

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
                return {
                    key: key,
                    label: key,
                    body: (
                        <div className="openapi-schema-body">
                            <div className="openapi-schema-presentation">
                                {getLabelForType(security)}

                                {security.description ? (
                                    <Markdown
                                        source={security.description}
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
            return <OpenAPISchemaName propertyName="apiKey" type="string" required />;
        case 'http':
            if (security.scheme === 'basic') {
                return 'Basic Auth';
            }

            if (security.scheme == 'bearer') {
                return (
                    <>
                        <OpenAPISchemaName propertyName="Authorization" type="string" required />
                        {/** Show a default description if none is provided */}
                        {!security.description ? (
                            <Markdown
                                source={`Bearer authentication header of the form Bearer ${`&lt;token&gt;`}.`}
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
