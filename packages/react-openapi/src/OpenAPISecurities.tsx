import { OpenAPIV3 } from 'openapi-types';
import { OpenAPIClientContext } from './types';
import { InteractiveSection } from './InteractiveSection';
import { Markdown } from './Markdown';

/**
 * Present authentication that can be used for this operation.
 */
export function OpenAPISecurities(props: {
    securities: OpenAPIV3.SecuritySchemeObject[];
    context: OpenAPIClientContext;
}) {
    const { securities } = props;

    if (securities.length === 0) {
        return null;
    }

    return (
        <InteractiveSection
            header="Authentication"
            className="openapi-authentication"
            tabs={securities.map((security, index) => {
                return {
                    key: `${index}`,
                    label: security.description ?? getLabelForType(security.type),
                    body: security.description ? <Markdown source={security.description} /> : null,
                };
            })}
        />
    );
}

function getLabelForType(type: OpenAPIV3.SecuritySchemeObject['type']) {
    switch (type) {
        case 'apiKey':
            return 'API Key';
        case 'http':
            return 'HTTP';
        case 'oauth2':
            return 'OAuth2';
        case 'openIdConnect':
            return 'OpenID Connect';
        default:
            return type;
    }
}
