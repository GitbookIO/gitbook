'use client';

import * as React from 'react';
import { OpenAPIClientContext } from './types';
import { OpenAPIV3 } from 'openapi-types';
import { ServerSelector } from './ServerSelector';
import { useOpenAPIContext } from './OpenAPIContextProvider';
import { getServersURL } from './utils';

export function ServerURLForm(props: {
    children: React.ReactNode;
    context: OpenAPIClientContext;
    servers: OpenAPIV3.ServerObject[];
    serverIndex: number;
}) {
    const { children, context, servers, serverIndex } = props;
    const stateContext = useOpenAPIContext();
    const server = servers[serverIndex];
    const formRef = React.useRef<HTMLFormElement>(null);

    function switchServer(index: number) {
        if (index !== serverIndex) {
            update({
                server: `${index}` ?? '0',
                ...(stateContext?.state?.edit ? { edit: 'true' } : undefined),
            });
        }
    }

    function updateServerVariables(formData: FormData) {
        const variableKeys = Object.keys(server.variables ?? {});
        const variables: Record<string, string> = {};
        for (const pair of formData) {
            if (variableKeys.includes(pair[0]) && !isNaN(Number(pair[1]))) {
                variables[pair[0]] = `${pair[1]}`;
            }
        }
        update({
            server: `${formData.get('server')}` ?? '0',
            ...variables,
            ...(stateContext?.state?.edit ? { edit: 'true' } : undefined),
        });
    }

    function update(variables?: Record<string, string>) {
        if (!context.blockKey) {
            return;
        }
        stateContext?.onUpdate({
            block: context.blockKey,
            ...variables,
        });
    }

    const isEditable = servers.length > 1 || server.variables;
    return (
        <form
            ref={formRef}
            onSubmit={(e) => {
                e.preventDefault();
                updateServerVariables(new FormData(e.currentTarget));
            }}
            className="contents"
        >
            <fieldset disabled={stateContext?.isPending} className="contents">
                <input type="hidden" name="block" value={context.blockKey} />
                {children}
                {stateContext?.state?.edit && servers.length > 1 ? (
                    <ServerSelector
                        servers={servers}
                        currentIndex={serverIndex}
                        onChange={switchServer}
                    />
                ) : null}
                {isEditable ? (
                    <button
                        className="openapi-edit-button ml-2"
                        onClick={() => {
                            const state = { ...stateContext?.state };
                            delete state.edit;
                            update({
                                server: `${serverIndex}`,
                                ...state,
                                ...(stateContext?.state?.edit
                                    ? { serverUrl: getServersURL(servers, state) }
                                    : { edit: 'true' }),
                            });
                        }}
                        title={
                            stateContext?.state?.edit ? undefined : 'Try different server options'
                        }
                        aria-label={stateContext?.state?.edit ? 'Clear' : 'Edit'}
                    >
                        {stateContext?.state?.edit ? context.icons.clear : context.icons.edit}
                    </button>
                ) : null}
            </fieldset>
        </form>
    );
}
