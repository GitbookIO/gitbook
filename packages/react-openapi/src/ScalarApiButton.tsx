'use client';

import * as React from 'react';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as ReactJSXRuntime from 'react/jsx-runtime';

import type { OpenAPIV3_1 } from '@gitbook/openapi-parser';
import {
    ScalarApiModal,
    type ScalarModalControllerRef,
    type ScalarRuntime,
} from './ScalarApiModal';
import type { OpenAPIClientContext } from './context';
import { t } from './translate';
import type { OpenAPIOperationData } from './types';

let scalarRuntimePromise: Promise<ScalarRuntime> | null = null;

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
    const [runtime, setRuntime] = useState<ScalarRuntime | null>(null);
    const controllerRef = useRef<ScalarModalControllerRef>(null);

    return (
        <div className="scalar scalar-activate">
            <button
                type="button"
                className="scalar-activate-button button"
                onClick={() => {
                    controllerRef.current?.openClient?.();
                    setIsOpen(true);
                    if (!runtime) {
                        void loadScalarRuntime(context.scalarRuntimeURL).then(setRuntime);
                    }
                }}
            >
                {t(context.translation, 'test_it')}
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
            </button>

            {isOpen &&
                runtime &&
                createPortal(
                    <ScalarApiModal
                        controllerRef={controllerRef}
                        method={method}
                        path={path}
                        securities={securities}
                        servers={servers}
                        specUrl={specUrl}
                        withProxy={withProxy}
                        context={context}
                        runtime={runtime}
                    />,
                    document.body
                )}
        </div>
    );
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
