'use client';

import * as React from 'react';
import { OpenAPIV3 } from 'openapi-types';
import { OpenAPIServerURLVariable } from './OpenAPIServerURLVariable';
import { OpenAPIClientContext } from './types';
import { ServerURLForm } from './OpenAPIServerURLForm';
import { useOpenAPIContext } from './OpenAPIContextProvider';
import { parseServerURL } from './utils';

/**
 * Show the url of the server with variables replaced by their default values.
 */
export function OpenAPIServerURL(props: {
    servers: OpenAPIV3.ServerObject[];
    context: OpenAPIClientContext;
    path?: string;
}) {
    const { path, servers, context } = props;
    const ctx = useOpenAPIContext();
    const serverIndex = !isNaN(Number(ctx?.state?.server)) ? Number(ctx?.state?.server) : 0;
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
                            selectionIndex={Number(ctx?.state?.[part.name])}
                            selectable={Boolean(ctx?.state?.edit)}
                        />
                    );
                }
            })}
            {path}
        </ServerURLForm>
    );
}
