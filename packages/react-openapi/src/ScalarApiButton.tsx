'use client';
import {
    Cookie,
    getHarRequest,
    getParametersFromOperation,
    type TransformedOperation,
    getRequestFromOperation,
    Query,
    Header,
} from '@scalar/oas-utils';
import React from 'react';

import { OpenAPIOperationData, fromJSON } from './fetchOpenAPIOperation';

const ApiClientReact = React.lazy(async () => {
    const mod = await import('@scalar/api-client-react');
    return { default: mod.ApiClientReact };
});

const ScalarContext = React.createContext<
    (fetchOperationData: () => Promise<OpenAPIOperationData>) => void
>(() => {});

/**
 * Button which launches the Scalar API Client
 */
export function ScalarApiButton(props: {
    fetchOperationData: () => Promise<OpenAPIOperationData>;
}) {
    const { fetchOperationData } = props;
    const open = React.useContext(ScalarContext);

    return (
        <div className="scalar scalar-activate">
            <button
                className="scalar-activate-button"
                onClick={() => {
                    open(fetchOperationData);
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="12" fill="none">
                    <path
                        stroke="currentColor"
                        strokeWidth="1.5"
                        d="M1 10.05V1.43c0-.2.2-.31.37-.22l7.26 4.08c.17.1.17.33.01.43l-7.26 4.54a.25.25 0 0 1-.38-.21Z"
                    />
                </svg>
                Test it
            </button>
        </div>
    );
}

/**
 * Wrap the rendering with a context to open the scalar modal.
 */
export function ScalarApiClient(props: { children: React.ReactNode }) {
    const { children } = props;

    const [active, setActive] = React.useState<null | {
        operationData: OpenAPIOperationData | null;
    }>(null);

    const proxy = '/~scalar/proxy';

    const open = React.useCallback(
        async (fetchOperationData: () => Promise<OpenAPIOperationData>) => {
            setActive({ operationData: null });
            const operationData = fromJSON(await fetchOperationData());
            setActive({ operationData });
        },
        [],
    );

    const onClose = React.useCallback(() => {
        setActive(null);
    }, []);

    const request = React.useMemo(() => {
        const operationData = active?.operationData;

        if (!operationData) {
            return null;
        }

        const operationId =
            operationData.operation.operationId ?? operationData.method + operationData.path;

        const operation = {
            ...operationData,
            httpVerb: operationData.method,
            pathParameters: operationData.operation.parameters,
        } as TransformedOperation;

        const variables = getParametersFromOperation(operation, 'path', false);

        const request = getHarRequest(
            {
                url: operationData.path,
            },
            getRequestFromOperation(operation, { requiredOnly: false }),
        );

        return {
            id: operationId,
            type: operationData.method,
            path: operationData.path,
            variables,
            cookies: request.cookies.map((cookie: Cookie) => {
                return { ...cookie, enabled: true };
            }),
            query: request.queryString.map((queryString: Query) => {
                const query: typeof queryString & { required?: boolean } = queryString;
                return { ...queryString, enabled: query.required ?? true };
            }),
            headers: request.headers.map((header: Header) => {
                return { ...header, enabled: true };
            }),
            url: operationData.servers[0]?.url,
            body: request.postData?.text,
        };
    }, [active]);

    return (
        <ScalarContext.Provider value={open}>
            {children}
            {active ? (
                <div className="scalar">
                    <div className="scalar-container">
                        <div className="scalar-app">
                            <div className="scalar-app-header">
                                <span>API Client </span>
                                <a
                                    href="https://www.scalar.com?utm_campaign=gitbook"
                                    target="_blank"
                                >
                                    Powered by scalar.com
                                </a>
                            </div>
                            {request ? (
                                <React.Suspense fallback={<ScalarLoading />}>
                                    <ApiClientReact
                                        close={onClose}
                                        proxy={proxy}
                                        isOpen={true}
                                        request={request}
                                    />
                                </React.Suspense>
                            ) : (
                                <ScalarLoading />
                            )}
                        </div>
                        <div onClick={() => onClose()} className="scalar-app-exit"></div>
                    </div>
                </div>
            ) : null}
        </ScalarContext.Provider>
    );
}

function ScalarLoading() {
    return <div className="scalar-app-loading">Loading...</div>;
}
