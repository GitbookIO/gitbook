import { OpenAPIV3 } from 'openapi-types';
import { OpenAPIClientContext } from './types';
import { InteractiveSection } from './InteractiveSection';
import { Markdown } from './Markdown';
import { OpenAPIOperationData } from './fetchOpenAPIOperation';

/**
 * Present authentication that can be used for this operation.
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
            header="Authentication"
            className="openapi-authentication"
            toggeable
            defaultOpened={false}
            toggleCloseIcon={context.icons.chevronDown}
            toggleOpenIcon={context.icons.chevronRight}
            tabs={securities.map(([key, security]) => {
                return {
                    key: key,
                    label: key,
                    body: (
                        <>
                            <p className="openapi-authentication-label">
                                {getLabelForType(security)}
                            </p>
                            {security.description ? (
                                <Markdown
                                    source={security.description}
                                    className="openapi-authentication-description"
                                />
                            ) : null}
                        </>
                    ),
                };
            })}
        />
    );
}

function getLabelForType(security: OpenAPIV3.SecuritySchemeObject) {
    switch (security.type) {
        case 'apiKey':
            return 'API Key';
        case 'http':
            if (security.scheme === 'basic') {
                return 'Basic Auth';
            }

            if (security.scheme == 'bearer') {
                return `Bearer Token ${security.bearerFormat ? `(${security.bearerFormat})` : ''}`;
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
