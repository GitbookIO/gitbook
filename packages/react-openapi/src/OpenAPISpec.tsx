import type { OpenAPI } from '@gitbook/openapi-parser';

import { OpenAPIRequestBody } from './OpenAPIRequestBody';
import { OpenAPIResponses } from './OpenAPIResponses';
import { OpenAPISchemaProperties } from './OpenAPISchemaServer';
import { OpenAPISecurities } from './OpenAPISecurities';
import { StaticSection } from './StaticSection';
import type { OpenAPIClientContext, OpenAPIOperationData } from './types';
import { parameterToProperty } from './utils';

export function OpenAPISpec(props: { data: OpenAPIOperationData; context: OpenAPIClientContext }) {
    const { data, context } = props;

    const { operation, securities } = data;

    const parameters = operation.parameters ?? [];
    const parameterGroups = groupParameters(parameters);

    return (
        <>
            {securities.length > 0 ? (
                <OpenAPISecurities key="securities" securities={securities} context={context} />
            ) : null}

            {parameterGroups.map((group) => {
                return (
                    <StaticSection
                        key={`parameter-${group.key}`}
                        className="openapi-parameters"
                        header={group.label}
                    >
                        <OpenAPISchemaProperties
                            properties={group.parameters.map(parameterToProperty)}
                            context={context}
                        />
                    </StaticSection>
                );
            })}

            {operation.requestBody ? (
                <OpenAPIRequestBody
                    key="body"
                    requestBody={operation.requestBody}
                    context={context}
                />
            ) : null}
            {operation.responses ? (
                <OpenAPIResponses
                    key="responses"
                    responses={operation.responses}
                    context={context}
                />
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
