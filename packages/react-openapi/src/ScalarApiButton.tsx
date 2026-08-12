'use client';

import * as React from 'react';
import { type ComponentType, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as ReactJSXRuntime from 'react/jsx-runtime';

import type { OpenAPIV3_1 } from '@gitbook/openapi-parser';
import type {
    ScalarApiModalProps,
    ScalarModalControllerRef,
    ScalarRuntime,
} from './ScalarApiModal';
import type { OpenAPIClientContext } from './context';
import { t } from './translate';
import type { OpenAPIOperationData } from './types';

let scalarRuntimePromise: Promise<ScalarRuntime> | null = null;

/** Everything needed to render the client, none of it in the initial bundle. */
type ScalarClient = {
    runtime: ScalarRuntime;
    Modal: ComponentType<ScalarApiModalProps>;
};

/**
 * Button which launches the Scalar API Client
 */
export function ScalarApiButton(props: {
    method: OpenAPIV3_1.HttpMethods;
    path: string;
    securities: OpenAPIOperationData['securities'];
    servers: OpenAPIOperationData['servers'];
    specUrl: string;
    withProxy: boolean;
    context: OpenAPIClientContext;
}) {
    const { method, path, securities, servers, specUrl, withProxy, context } = props;
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [client, setClient] = useState<ScalarClient | null>(null);
    const controllerRef = useRef<ScalarModalControllerRef>(null);

    return (
        <div className="scalar scalar-activate">
            <button
                type="button"
                className="scalar-activate-button button"
                aria-busy={isLoading}
                onClick={() => {
                    controllerRef.current?.openClient?.();
                    setIsOpen(true);
                    if (!client) {
                        setIsLoading(true);
                        loadScalarClient(context.scalarRuntimeURL)
                            .then(setClient)
                            .catch((error) => {
                                console.error('Unable to load the Scalar API client', error);
                                setIsOpen(false);
                                setIsLoading(false);
                            });
                    }
                }}
            >
                {t(context.translation, 'test_it')}
                {isLoading ? (
                    <svg
                        className="scalar-activate-spinner"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeOpacity="0.3"
                            strokeWidth="3"
                        />
                        <path
                            d="M12 2a10 10 0 0 1 10 10"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                ) : (
                    <svg
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 10 12"
                        fill="currentColor"
                    >
                        <path
                            stroke="currentColor"
                            strokeWidth="1.5"
                            d="M1 10.05V1.43c0-.2.2-.31.37-.22l7.26 4.08c.17.1.17.33.01.43l-7.26 4.54a.25.25 0 0 1-.38-.21Z"
                        />
                    </svg>
                )}
            </button>

            {isOpen &&
                client &&
                createPortal(
                    <client.Modal
                        controllerRef={controllerRef}
                        method={method}
                        path={path}
                        securities={securities}
                        servers={servers}
                        specUrl={specUrl}
                        withProxy={withProxy}
                        context={context}
                        runtime={client.runtime}
                        onReady={() => setIsLoading(false)}
                    />,
                    document.body
                )}
        </div>
    );
}

/** Fetch the modal chunk and the Scalar runtime in parallel. */
async function loadScalarClient(runtimeURL: string): Promise<ScalarClient> {
    const [runtime, mod] = await Promise.all([
        loadScalarRuntime(runtimeURL),
        import('./ScalarApiModal'),
    ]);

    return { runtime, Modal: mod.ScalarApiModal };
}

async function loadScalarRuntime(runtimeURL: string): Promise<ScalarRuntime> {
    if (!scalarRuntimePromise) {
        Object.assign(globalThis, {
            __gitbookScalarReact: React,
            __gitbookScalarJSXRuntime: ReactJSXRuntime,
        });
        scalarRuntimePromise = import(/* webpackIgnore: true */ runtimeURL).catch((error) => {
            scalarRuntimePromise = null;
            throw error;
        });
    }

    return scalarRuntimePromise;
}
