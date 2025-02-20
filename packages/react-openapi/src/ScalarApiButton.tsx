'use client';

import { ApiClientModalProvider, useApiClientModal } from '@scalar/api-client-react';
import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useOpenAPIOperationContext } from './OpenAPIOperationContext';
import { OpenAPIV3_1 } from '@gitbook/openapi-parser';

/**
 * Button which launches the Scalar API Client
 */
export function ScalarApiButton(props: {
    method: OpenAPIV3_1.HttpMethods;
    path: string;
    specUrl: string;
}) {
    const { method, path, specUrl } = props;
    const [isOpen, setIsOpen] = useState(false);
    const controllerRef = useRef<ScalarModalControllerRef>(null);
    return (
        <div className="scalar scalar-activate">
            <button
                className="scalar-activate-button button"
                onClick={() => {
                    controllerRef.current?.openClient?.();
                    setIsOpen(true);
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

            {isOpen &&
                createPortal(
                    <ScalarModal
                        controllerRef={controllerRef}
                        method={method}
                        path={path}
                        specUrl={specUrl}
                    />,
                    document.body,
                )}
        </div>
    );
}

function ScalarModal(props: {
    method: OpenAPIV3_1.HttpMethods;
    path: string;
    specUrl: string;
    controllerRef: React.Ref<ScalarModalControllerRef>;
}) {
    const { method, path, specUrl, controllerRef } = props;
    return (
        <ApiClientModalProvider
            configuration={{ spec: { url: specUrl } }}
            initialRequest={{ path, method }}
        >
            <ScalarModalController method={method} path={path} controllerRef={controllerRef} />
        </ApiClientModalProvider>
    );
}

type ScalarModalControllerRef = {
    openClient: (() => void) | undefined;
};

function ScalarModalController(props: {
    method: OpenAPIV3_1.HttpMethods;
    path: string;
    controllerRef: React.Ref<ScalarModalControllerRef>;
}) {
    const { method, path, controllerRef } = props;
    const client = useApiClientModal();
    const openClient = client?.open;
    useImperativeHandle(
        controllerRef,
        () => ({ openClient: openClient ? () => openClient() : undefined }),
        [openClient],
    );

    // Open the client when the component is mounted.
    const { onOpenClient } = useOpenAPIOperationContext();
    useEffect(() => {
        if (openClient) {
            openClient({ method, path });
            onOpenClient({ method, path });
        }
    }, [openClient, onOpenClient]);
    return null;
}
