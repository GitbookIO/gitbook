import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { Fragment } from 'react';
import { InteractiveSection } from './InteractiveSection';
import { Markdown } from './Markdown';
import { OpenAPICopyButton } from './OpenAPICopyButton';
import { OpenAPIRequiredScopes } from './OpenAPIRequiredScopes';
import { OpenAPISchemaName } from './OpenAPISchemaName';
import type { OpenAPIClientContext } from './context';
import { t } from './translate';
import type { OpenAPICustomSecurityScheme } from './types';
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
    const stateKey = createStateKey('securities', context.blockKey);

    return (
        <>
            <OpenAPIRequiredScopes context={context} stateKey={stateKey} securities={tabsData} />
            <InteractiveSection
                header={t(context.translation, 'authorizations')}
                stateKey={stateKey}
                toggleIcon={context.icons.chevronRight}
                selectIcon={context.icons.chevronDown}
                className="openapi-securities"
                tabs={tabsData.map(({ key, label, schemes }) => ({
                    key,
                    label,
                    body: (
                        <div className="openapi-schema">
                            {schemes.map((security, index) => {
                                // OAuth2 description is already rendered in OpenAPISchemaOAuth2Item
                                const description =
                                    security.type !== 'oauth2'
                                        ? resolveDescription(security)
                                        : undefined;
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
        </>
    );
}

function getLabelForType(security: OpenAPICustomSecurityScheme, context: OpenAPIClientContext) {
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
                return (
                    <>
                        <OpenAPISchemaName
                            context={context}
                            propertyName="Authorization"
                            type="string"
                            required={security.required}
                        />
                        {/** Show a default description if none is provided */}
                        {!security.description ? (
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
    security: OpenAPICustomSecurityScheme & { flows?: OpenAPIV3.OAuth2SecurityScheme['flows'] };
}) {
    const { context, security } = props;

    const flows = security.flows ? Object.entries(security.flows) : [];

    return (
        <div className="openapi-securities-oauth-flows">
            {flows.map(([name, flow], index) => (
                <Fragment key={index}>
                    <OpenAPISchemaOAuth2Item
                        flow={flow}
                        name={name}
                        context={context}
                        security={security}
                    />
                    {index < flows.length - 1 ? <hr /> : null}
                </Fragment>
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
    security: OpenAPICustomSecurityScheme & { flows?: OpenAPIV3.OAuth2SecurityScheme['flows'] };
}) {
    const { flow, context, security, name } = props;

    if (!flow) {
        return null;
    }

    const description = resolveDescription(security);

    return (
        <div>
            <OpenAPISchemaName
                context={context}
                propertyName="OAuth2"
                type={name}
                required={security.required}
            />
            <div className="openapi-securities-oauth-content openapi-markdown">
                {description ? (
                    <Markdown source={description} className="openapi-securities-description" />
                ) : null}
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
            </div>
        </div>
    );
}
