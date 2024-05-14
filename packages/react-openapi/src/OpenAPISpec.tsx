'use client';

import { OpenAPIV3 } from 'openapi-types';

import { OpenAPIOperationData, fromJSON } from './fetchOpenAPIOperation';
import { InteractiveSection } from './InteractiveSection';
import { OpenAPIRequestBody } from './OpenAPIRequestBody';
import { OpenAPIResponses } from './OpenAPIResponses';
import { OpenAPISchemaProperties } from './OpenAPISchema';
import { OpenAPISecurities } from './OpenAPISecurities';
import { OpenAPIClientContext } from './types';
import { noReference } from './utils';

/**
 * Client component to render the spec for the request and response.
 *
 * We use a client component as rendering recursive JSON schema in the server is expensive
 * (the entire schema is rendered at once, while the client component only renders the visible part)
 */
export function OpenAPISpec(props: { rawData: any; context: OpenAPIClientContext }) {
    const { rawData, context } = props;

    const parsedData = fromJSON(rawData) as OpenAPIOperationData;
    const { operation, securities } = parsedData;

    const parameterGroups = groupParameters((operation.parameters || []).map(noReference));

    return (
        <>
            {securities.length > 0 ? (
                <OpenAPISecurities securities={securities} context={context} />
            ) : null}

            {parameterGroups.map((group) => (
                <InteractiveSection
                    key={group.key}
                    className="openapi-parameters"
                    toggeable
                    toggleOpenIcon={context.icons.chevronRight}
                    toggleCloseIcon={context.icons.chevronDown}
                    header={group.label}
                    defaultOpened={group.key === 'path' || context.defaultInteractiveOpened}
                >
                    <OpenAPISchemaProperties
                        properties={group.parameters.map((parameter) => ({
                            propertyName: parameter.name,
                            schema: {
                                // Description of the parameter is defined at the parameter level
                                // we use display it if the schema doesn't override it
                                description: parameter.description,
                                example: parameter.example,
                                ...(noReference(parameter.schema) ?? {}),
                            },
                            required: parameter.required,
                        }))}
                        context={context}
                    />
                </InteractiveSection>
            ))}

            {operation.requestBody ? (
                <OpenAPIRequestBody
                    requestBody={noReference(operation.requestBody)}
                    context={context}
                />
            ) : null}
            {operation.responses ? (
                <OpenAPIResponses responses={noReference(operation.responses)} context={context} />
            ) : null}
        </>
    );
}

function groupParameters(parameters: OpenAPIV3.ParameterObject[]): Array<{
    key: string;
    label: string;
    parameters: OpenAPIV3.ParameterObject[];
}> {
    const sorted = ['path', 'query', 'header'];

    const groups: Array<{
        key: string;
        label: string;
        parameters: OpenAPIV3.ParameterObject[];
    }> = [];

    parameters.forEach((parameter) => {
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
