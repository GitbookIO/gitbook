import * as React from 'react';
import { OpenAPIV3 } from 'openapi-types';
import { OpenAPIServerURLVariable } from './OpenAPIServerURLVariable';
import { OpenAPIClientContext } from './types';
import { ServerURLForm } from './OpenAPIServerURLForm';
import { ServerSelector } from './ServerSelector';

/**
 * Show the url of the server with variables replaced by their default values.
 */
export function OpenAPIServerURL(props: {
    servers: OpenAPIV3.ServerObject[];
    context: OpenAPIClientContext;
    path?: string;
}) {
    const { path, servers, context } = props;
    const serverIndex = context.enumSelectors?.server ?? 0;
    const server = servers[serverIndex];
    const parts = parseServerURL(server?.url ?? '');

    return (
        <ServerURLForm context={context} servers={servers} serverIndex={serverIndex}>
            {parts.map((part, i) => {
                if (part.kind === 'text') { 
                    return <span key={i}>{part.text}</span>;
                } else {
                    if (!server.variables?.[part.name]) {
                        return <span key={i}>{`{${part.name}}`}</span>;
                    }

                    return (
                        <OpenAPIServerURLVariable
                            key={i}
                            name={part.name}
                            variable={server.variables[part.name]}
                            enumIndex={context.enumSelectors?.[part.name]}
                        />
                    );
                }
            })}{path}
        </ServerURLForm>
    );
}

/**
 * Get the default URL for the server.
 */
export function getServersURL(
    servers: OpenAPIV3.ServerObject[],
    selectors?: Record<string, number>,
): string {
    const serverIndex = selectors && !isNaN(selectors.server) ? Number(selectors.server) : 0;
    const server = servers[serverIndex];
    const parts = parseServerURL(server?.url ?? '');

    return parts
        .map((part) => {
            if (part.kind === 'text') {
                return part.text;
            } else {
                return selectors && !isNaN(selectors[part.name])
                    ? server.variables?.[part.name]?.enum?.[selectors[part.name]]
                    : (server.variables?.[part.name]?.default ?? `{${part.name}}`);
            }
        })
        .join('');
}

function parseServerURL(url: string) {
    const parts = url.split(/{([^}]+)}/g);
    const result: Array<{ kind: 'variable'; name: string } | { kind: 'text'; text: string }> = [];
    for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
            result.push({ kind: 'text', text: parts[i] });
        } else {
            result.push({ kind: 'variable', name: parts[i] });
        }
    }
    return result;
}
