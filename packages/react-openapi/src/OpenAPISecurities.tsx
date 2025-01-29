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
            className="openapi-securities"
            tabs={securities.map(([key, security]) => {
                return {
                    key: key,
                    label: key,
                    body: (
                        <>
                            <p className="openapi-securities-label">{getLabelForType(security)}</p>
                            {security.description ? (
                                <Markdown
                                    source={security.description}
                                    className="openapi-securities-description"
                                />
                            ) : null}
                        </>
                    ),
                };
            })}
        />
    );
}

function getLabelForType(security: OpenAPIV3_1.SecuritySchemeObject): string {
    switch (security.type) {
        case 'apiKey':
            return (
                <div className="openapi-schema-presentation">
                    <OpenAPISchemaName propertyName="apiKey" type="string" required />
                </div>
            );
        case 'http':
            if (security.scheme === 'basic') {
                return 'Basic Auth';
            }

            if (security.scheme == 'bearer') {
                return (
                    <div className="openapi-schema-presentation">
                        <OpenAPISchemaName propertyName="Authorization" type="string" required />
                        <div className="openapi-schema-description openapi-markdown">{`Bearer authentication header of the form Bearer <token>.`}</div>
                    </div>
                );
            }

            return 'HTTP';
        case 'oauth2':
            return 'OAuth2';
        case 'openIdConnect':
            return 'OpenID Connect';
        default:
            // @ts-ignore
            return security.type;
    }
}
