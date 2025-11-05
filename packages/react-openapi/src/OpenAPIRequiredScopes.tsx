'use client';

import { OpenAPICopyButton } from './OpenAPICopyButton';
import { OpenAPIDisclosure } from './OpenAPIDisclosure';
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
        if (scheme.type === 'oauth2') {
            return Object.entries(scheme.flows ?? {}).flatMap(([_, flow]) =>
                Object.entries(flow.scopes ?? {})
            );
        }

        return scheme.scopes ?? [];
    });

    if (!scopes.length) {
        return null;
    }

    return (
        <OpenAPIDisclosure
            defaultExpanded
            className="openapi-required-scopes"
            header={
                <div className="openapi-required-scopes-header">
                    {context.icons.lock}
                    <span>{t(context.translation, 'required_scopes')}</span>
                </div>
            }
            icon={context.icons.plus}
            label=""
        >
            <OpenAPISchemaScopes scopes={scopes} context={context} />
        </OpenAPIDisclosure>
    );
}

function OpenAPISchemaScopes(props: {
    scopes: OpenAPISecurityScope[];
    context: OpenAPIClientContext;
}) {
    const { scopes, context } = props;

    return (
        <div className="openapi-securities-scopes openapi-markdown">
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
            {scope[1] ? `: ${scope[1]}` : null}
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
