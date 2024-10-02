'use client';

import * as React from 'react';
import { OpenAPIOperationData } from './fetchOpenAPIOperation';
import { getServersURL } from './utils';
import { OpenAPIV3 } from 'openapi-types';

type OpenAPIClientStateContextProps = {
    /**
     * Whether client state updates are in a pending state,
     * i.e. is a transition in progress.
     */
    isPending?: boolean;
    /**
     * The server url
     */
    serverUrl?: string;
    /**
     * The current state
     */
    state?: Record<string, string> | null;
    /**
     * Callback for when the client state is updated
     */
    onUpdate: (params: Record<string, string> | null) => void;
};

const OpenAPIClientStateContext = React.createContext<OpenAPIClientStateContextProps | null>(null);

export function useOpenAPIClientState() {
    return React.useContext(OpenAPIClientStateContext);
}

/**
 * Control client state for an OpenAPI operation
 */
export function OpenAPIClientState(props: {
    children: React.ReactNode;
    servers: OpenAPIV3.ServerObject[];
    isPending?: boolean;
    params?: Record<string, string>;
    onUpdate: OpenAPIClientStateContextProps['onUpdate'];
}) {
    const { children, servers, isPending, params, onUpdate } = props;

    const clientState = React.useMemo(() => {
        if (!params) {
            return null;
        }
        return parseClientStateModifiers(servers, params);
    }, [servers, params]);
    const serverUrl = getServersURL(servers, clientState ?? undefined);

    return (
        <OpenAPIClientStateContext.Provider
            value={{
                isPending,
                state: clientState,
                serverUrl,
                onUpdate,
            }}
        >
            {children}
        </OpenAPIClientStateContext.Provider>
    );
}

function parseClientStateModifiers(servers: OpenAPIV3.ServerObject[], params: Record<string, string>) {
    if (!servers) {
        return null;
    }
    const serverQueryParam = params['server'];
    const serverIndex =
        serverQueryParam && !isNaN(Number(serverQueryParam))
            ? Math.max(0, Math.min(Number(serverQueryParam), servers.length - 1))
            : 0;
    const server = servers[serverIndex];
    return server
        ? Object.keys(server.variables ?? {}).reduce<Record<string, string>>(
              (result, key) => {
                  const selection = params[key];
                  if (!isNaN(Number(selection))) {
                      result[key] = selection;
                  }
                  return result;
              },
              { server: `${serverIndex}`, edit: params['edit'] },
          )
        : null;
}
