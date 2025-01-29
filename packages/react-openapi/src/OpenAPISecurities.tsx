import * as React from 'react';
import { OpenAPIV3_1 } from '@scalar/openapi-types';
import { OpenAPIClientContext } from './types';
import { InteractiveSection } from './InteractiveSection';
import { Markdown } from './Markdown';
import { OpenAPIOperationData } from './fetchOpenAPIOperation';

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
            return 'API Key';
        case 'http':
            if (security.scheme === 'basic') {
                return 'Basic Auth';
            }

            if (security.scheme == 'bearer') {
                return (
                    <div className="openapi-schema-presentation">
                        <div className="openapi-schema-name">
                            <span className="openapi-schema-propertyname">Authorization</span>
                            <span className="openapi-schema-type">string</span>
                            <span className="openapi-schema-required">required</span>
                        </div>
                        <Markdown
                            source={`Bearer authentication header of the form Bearer <token>.`}
                            className="openapi-schema-description"
                        />
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
