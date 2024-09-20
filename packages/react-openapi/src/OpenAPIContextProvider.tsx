'use client'

import * as React from 'react';
import { OpenAPIOperationData } from './fetchOpenAPIOperation';
import { getServersURL } from './utils';

type OpenAPIContextProps = { isPending?: boolean; serverUrl?: string; state?: Record<string, string> | null, onUpdate: (params: Record<string, string> | null) => void; }
const OpenAPIContext = React.createContext<OpenAPIContextProps | null>(null);

export function useOpenAPIContext() {
    return React.useContext(OpenAPIContext);
}

export function OpenAPIContextProvider(props: { children: React.ReactNode; data: OpenAPIOperationData; isPending?: boolean; params?: Record<string, string>; onUpdate: OpenAPIContextProps['onUpdate']; }) {
    const { children, data, isPending, params, onUpdate } = props;
    
    const clientState = React.useMemo(() => {
        if (!params) { return null; }
        return parseClientStateModifiers(data, params);
    }, [data, params]);
    const serverUrl = getServersURL(data.servers, clientState ?? undefined)

    return <OpenAPIContext.Provider value={{
        isPending,
        state: clientState,
        serverUrl,
        onUpdate
    }}>{children}</OpenAPIContext.Provider>
}


function parseClientStateModifiers(data: OpenAPIOperationData, params: Record<string, string>) {
    if (!data) {
        return null;
    }
    const serverQueryParam = params['server'];
    const serverIndex =
        serverQueryParam && !isNaN(Number(serverQueryParam))
            ? Math.max(0, Math.min(Number(serverQueryParam), data.servers.length - 1))
            : 0;
    const server = data.servers[serverIndex];
    return server ? Object.keys(server.variables ?? {}).reduce<Record<string, string>>(
        (result, key) => {
            const selection = params[key];
            if (!isNaN(Number(selection))) {
                result[key] = selection;
            }
            return result;
        },
        { server: `${serverIndex}`, edit: params['edit'] },
    ) : null;
}