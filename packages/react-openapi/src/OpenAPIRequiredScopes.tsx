'use client';

import { OpenAPICopyButton } from './OpenAPICopyButton';
import { OpenAPIDisclosureGroup } from './OpenAPIDisclosureGroup';
import { useSelectState } from './OpenAPISelect';
import type { OpenAPIClientContext } from './context';
import { t } from './translate';
import type { OpenAPISecurityScope } from './types';
import type { OperationSecurityInfo } from './utils';

/**
 * Present securities authorization that can be used for this operation.
 */
export function OpenAPIRequiredScopes(props: {
    securities: OperationSecurityInfo[];
    context: OpenAPIClientContext;
    stateKey: string;
}) {
    const { securities, stateKey, context } = props;
    const { key: selectedKey } = useSelectState(stateKey, securities[0]?.key);
    const selectedSecurity = securities.find((security) => security.key === selectedKey);

    if (!selectedSecurity) {
        return null;
    }

    const scopes = selectedSecurity.schemes.flatMap((scheme) => {
        return scheme.scopes ?? [];
    });

    if (!scopes.length) {
        return null;
    }

    return (
        <OpenAPIDisclosureGroup
            className="openapi-required-scopes"
            icon={context.icons.chevronRight}
            stateKey="required-scopes"
            defaultExpandedKeys={['required-scopes']}
            groups={[
                {
                    key: 'required-scopes',
                    label: (
                        <div className="openapi-required-scopes-header">
                            {context.icons.lock}
                            <span>{t(context.translation, 'required_scopes')}</span>
                        </div>
                    ),
                    tabs: [
                        {
                            key: 'scopes',
                            label: '',
                            body: <OpenAPISchemaScopes scopes={scopes} context={context} />,
                        },
                    ],
                },
            ]}
        />
    );
}

export function OpenAPISchemaScopes(props: {
    scopes: OpenAPISecurityScope[];
    context: OpenAPIClientContext;
    isOAuth2?: boolean;
}) {
    const { scopes, context, isOAuth2 } = props;

    return (
        <div className="openapi-securities-scopes openapi-markdown">
            <div className="openapi-required-scopes-description">
                {t(
                    context.translation,
                    isOAuth2 ? 'available_scopes' : 'required_scopes_description'
                )}
            </div>
            <ul>
                {scopes.map((scope) => (
                    <OpenAPIScopeItem key={scope[0]} scope={scope} context={context} />
                ))}
            </ul>
        </div>
    );
}

/**
 * Display a scope item. Either a key-value pair or a single string.
 */
function OpenAPIScopeItem(props: {
    scope: OpenAPISecurityScope;
    context: OpenAPIClientContext;
}) {
    const { scope, context } = props;

    return (
        <li>
            <OpenAPIScopeItemKey name={scope[0]} context={context} />
            {scope[1] ? <span>: {scope[1]}</span> : null}
        </li>
    );
}

/**
 * Displays the scope name within a copyable button.
 */
function OpenAPIScopeItemKey(props: {
    name: string;
    context: OpenAPIClientContext;
}) {
    const { name, context } = props;

    return (
        <OpenAPICopyButton value={name} context={context} withTooltip>
            <code>{name}</code>
        </OpenAPICopyButton>
    );
}
