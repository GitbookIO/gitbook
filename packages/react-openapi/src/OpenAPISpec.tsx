'use client';

import type { OpenAPI } from '@gitbook/openapi-parser';

import { InteractiveSection } from './InteractiveSection';
import { OpenAPIRequestBody } from './OpenAPIRequestBody';
import { OpenAPIResponses } from './OpenAPIResponses';
import { OpenAPISchemaProperties } from './OpenAPISchema';
import { OpenAPISecurities } from './OpenAPISecurities';
import type { OpenAPIClientContext, OpenAPIOperationData } from './types';
import { parameterToProperty } from './utils';

/**
 * Client component to render the spec for the request and response.
 *
 * We use a client component as rendering recursive JSON schema in the server is expensive
 * (the entire schema is rendered at once, while the client component only renders the visible part)
 */
export function OpenAPISpec(props: { data: OpenAPIOperationData; context: OpenAPIClientContext }) {
    const { data, context } = props;

    const { operation, securities } = data;

    const parameters = operation.parameters ?? [];
    const parameterGroups = groupParameters(parameters);

    return (
        <>
            {securities.length > 0 ? (
                <OpenAPISecurities securities={securities} context={context} />
            ) : null}

            {parameterGroups.map((group) => {
                return (
                    <InteractiveSection
                        key={group.key}
                        className="openapi-parameters"
                        header={group.label}
                    >
                        <OpenAPISchemaProperties
                            properties={group.parameters.map(parameterToProperty)}
                            context={context}
                        />
                    </InteractiveSection>
                );
            })}

            {operation.requestBody ? (
                <OpenAPIRequestBody requestBody={operation.requestBody} context={context} />
            ) : null}
            {operation.responses ? (
                <OpenAPIResponses responses={operation.responses} context={context} />
            ) : null}
        </>
    );
}

function groupParameters(parameters: OpenAPI.Parameters): Array<{
    key: string;
    label: string;
    parameters: OpenAPI.Parameters;
}> {
    const sorted = ['path', 'query', 'header'];

    const groups: Array<{
        key: string;
        label: string;
        parameters: OpenAPI.Parameters;
    }> = [];

    parameters
        .filter((parameter) => parameter.in)
        .forEach((parameter) => {
            const key = parameter.in;
            const label = getParameterGroupName(parameter.in);
            const group = groups.find((group) => group.key === key);
            if (group) {
                group.parameters.push(parameter);
            } else {
                groups.push({
                    key,
                    label,
                    parameters: [parameter],
                });
            }
        });

    groups.sort((a, b) => sorted.indexOf(a.key) - sorted.indexOf(b.key));

    return groups;
}

function getParameterGroupName(paramIn: string): string {
    switch (paramIn) {
        case 'path':
            return 'Path parameters';
        case 'query':
            return 'Query parameters';
        case 'header':
            return 'Header parameters';
        default:
            return paramIn;
    }
}
