import type { OpenAPI } from '@gitbook/openapi-parser';

import { OpenAPIRequestBody } from './OpenAPIRequestBody';
import { OpenAPIResponses } from './OpenAPIResponses';
import { OpenAPISchemaProperties } from './OpenAPISchemaServer';
import { OpenAPISecurities } from './OpenAPISecurities';
import { StaticSection } from './StaticSection';
import type { OpenAPIClientContext } from './context';
import { tString } from './translate';
import type { OpenAPIOperationData, OpenAPIWebhookData } from './types';
import { parameterToProperty } from './utils';

export function OpenAPISpec(props: {
    data: OpenAPIOperationData | OpenAPIWebhookData;
    context: OpenAPIClientContext;
}) {
    const { data, context } = props;

    const { operation } = data;

    const parameters = deduplicateParameters(operation.parameters ?? []);
    const parameterGroups = groupParameters(parameters, context);

    const securities = 'securities' in data ? data.securities : [];

    return (
        <>
            {securities.length > 0 ? (
                <OpenAPISecurities
                    key="securities"
                    securityRequirement={operation.security}
                    securities={securities}
                    context={context}
                />
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
                    data={data}
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

function groupParameters(
    parameters: OpenAPI.Parameters,
    context: OpenAPIClientContext
): Array<{
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
            const label = getParameterGroupName(parameter.in, context);
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

function getParameterGroupName(paramIn: string, context: OpenAPIClientContext): string {
    switch (paramIn) {
        case 'path':
            return tString(context.translation, 'path_parameters');
        case 'query':
            return tString(context.translation, 'query_parameters');
        case 'header':
            return tString(context.translation, 'header_parameters');
        default:
            return paramIn;
    }
}

/** Deduplicate parameters by name and in.
 * Some specs have both parameters define at path and operation level.
 * We only want to display one of them.
 * Parameters can have the wrong type (object instead of array) sometimes, we just return an empty array in that case.
 */
function deduplicateParameters(parameters: OpenAPI.Parameters): OpenAPI.Parameters {
    const seen = new Set();

    return Array.isArray(parameters)
        ? parameters.filter((param) => {
              const key = `${param.name}:${param.in}`;

              if (seen.has(key)) {
                  return false;
              }

              seen.add(key);

              return true;
          })
        : [];
}
