import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { InteractiveSection } from './InteractiveSection';
import { Markdown } from './Markdown';
import { OpenAPICopyButton } from './OpenAPICopyButton';
import { OpenAPISchemaName } from './OpenAPISchemaName';
import type { OpenAPIClientContext } from './context';
import { t } from './translate';
import type { OpenAPISecuritySchemeWithRequired } from './types';
import type { OpenAPIOperationData } from './types';
import { createStateKey, extractOperationSecurityInfo, resolveDescription } from './utils';

/**
 * Present securities authorization that can be used for this operation.
 */
export function OpenAPISecurities(props: {
    securityRequirement: OpenAPIV3.OperationObject['security'];
    securities: OpenAPIOperationData['securities'];
    context: OpenAPIClientContext;
}) {
    const { securityRequirement, securities, context } = props;

    if (!securities || securities.length === 0) {
        return null;
    }

    const tabsData = extractOperationSecurityInfo({ securityRequirement, securities });

    return (
        <InteractiveSection
            header={t(context.translation, 'authorizations')}
            stateKey={createStateKey('securities', context.blockKey)}
            toggeable
            defaultOpened={false}
            toggleIcon={context.icons.chevronRight}
            selectIcon={context.icons.chevronDown}
            className="openapi-securities"
            tabs={tabsData.map(({ key, label, schemes }) => ({
                key,
                label,
                body: (
                    <div className="openapi-schema">
                        {schemes.map((security, index) => {
                            const description = resolveDescription(security);
                            return (
                                <div
                                    key={`${key}-${index}`}
                                    className="openapi-schema-presentation"
                                >
                                    {getLabelForType(security, context)}
                                    {description ? (
                                        <Markdown
                                            source={description}
                                            className="openapi-securities-description"
                                        />
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                ),
            }))}
        />
    );
}

function getLabelForType(
    security: OpenAPISecuritySchemeWithRequired,
    context: OpenAPIClientContext
) {
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
            return <OpenAPISchemaOAuth2Flows context={context} security={security} />;
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

function OpenAPISchemaOAuth2Flows(props: {
    context: OpenAPIClientContext;
    security: OpenAPIV3.OAuth2SecurityScheme & { required?: boolean };
}) {
    const { context, security } = props;

    const flows = Object.entries(security.flows ?? {});

    return (
        <div className="openapi-securities-oauth-flows">
            {flows.map(([name, flow], index) => (
                <OpenAPISchemaOAuth2Item
                    key={index}
                    flow={flow}
                    name={name}
                    context={context}
                    security={security}
                />
            ))}
        </div>
    );
}

function OpenAPISchemaOAuth2Item(props: {
    flow: NonNullable<OpenAPIV3.OAuth2SecurityScheme['flows']>[keyof NonNullable<
        OpenAPIV3.OAuth2SecurityScheme['flows']
    >];
    name: string;
    context: OpenAPIClientContext;
    security: OpenAPIV3.OAuth2SecurityScheme & { required?: boolean };
}) {
    const { flow, context, security, name } = props;

    if (!flow) {
        return null;
    }

    const scopes = Object.entries(flow?.scopes ?? {});

    return (
        <div>
            <OpenAPISchemaName
                context={context}
                propertyName="OAuth2"
                type={name}
                required={security.required}
            />
            <div className="openapi-securities-oauth-content openapi-markdown">
                {security.description ? <Markdown source={security.description} /> : null}
                {'authorizationUrl' in flow && flow.authorizationUrl ? (
                    <span>
                        Authorization URL:{' '}
                        <OpenAPICopyButton
                            value={flow.authorizationUrl}
                            context={context}
                            className="openapi-securities-url"
                            withTooltip
                        >
                            {flow.authorizationUrl}
                        </OpenAPICopyButton>
                    </span>
                ) : null}
                {'tokenUrl' in flow && flow.tokenUrl ? (
                    <span>
                        Token URL:{' '}
                        <OpenAPICopyButton
                            value={flow.tokenUrl}
                            context={context}
                            className="openapi-securities-url"
                            withTooltip
                        >
                            {flow.tokenUrl}
                        </OpenAPICopyButton>
                    </span>
                ) : null}
                {'refreshUrl' in flow && flow.refreshUrl ? (
                    <span>
                        Refresh URL:{' '}
                        <OpenAPICopyButton
                            value={flow.refreshUrl}
                            context={context}
                            className="openapi-securities-url"
                            withTooltip
                        >
                            {flow.refreshUrl}
                        </OpenAPICopyButton>
                    </span>
                ) : null}
                {scopes.length ? (
                    <div>
                        {t(context.translation, 'available_scopes')}:{' '}
                        <ul>
                            {scopes.map(([key, value]) => (
                                <li key={key}>
                                    <OpenAPICopyButton value={key} context={context} withTooltip>
                                        <code>{key}</code>
                                    </OpenAPICopyButton>
                                    : {value}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
