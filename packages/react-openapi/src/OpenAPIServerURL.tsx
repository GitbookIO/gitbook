'use client';

import * as React from 'react';
import { OpenAPIV3 } from 'openapi-types';
import classNames from 'classnames';

import { OpenAPIServerURLVariable } from './OpenAPIServerURLVariable';
import { OpenAPIClientContext } from './types';
import { ServerURLForm } from './OpenAPIServerURLForm';
import { useOpenAPIClientState } from './OpenAPIClientStateContext';
import { parseServerURL } from './utils';

/**
 * Show the url of the server, where there are variables they are replaced by their default values.
 * If a stateContext is provided with an `onUpdate` callback then the variables can be edited and 
 * if there are multiple servers available they can be selected.
 */
export function OpenAPIServerURL(props: {
    servers: OpenAPIV3.ServerObject[];
    context: OpenAPIClientContext;
    path?: string;
}) {
    const { path, servers, context } = props;
    const stateContext = useOpenAPIClientState();

    const serverIndex = !isNaN(Number(stateContext?.state?.server))
        ? Number(stateContext?.state?.server)
        : 0;
    const server = servers[serverIndex];
    const parts = parseServerURL(server?.url ?? '');

    if (!server) {
        return null;
    }

    return (
        <ServerURLForm context={context} servers={servers} serverIndex={serverIndex}>
            <span className={classNames(stateContext?.isPending && 'openapi-pending')}>
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
                                selectionIndex={Number(stateContext?.state?.[part.name])}
                                selectable={Boolean(stateContext?.state?.edit)}
                            />
                        );
                    }
                })}
                {path}
            </span>
        </ServerURLForm>
    );
}
