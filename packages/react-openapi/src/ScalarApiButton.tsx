'use client';

import { ApiClientModalProvider, useApiClientModal } from '@scalar/api-client-react';
import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useEventCallback } from 'usehooks-ts';
import { useOpenAPIOperationContext } from './OpenAPIOperationContext';

/**
 * Button which launches the Scalar API Client
 */
export function ScalarApiButton({
    method,
    path,
    specUrl,
}: {
    method: string;
    path: string;
    specUrl: string;
}) {
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
                    document.body
                )}
        </div>
    );
}

function ScalarModal(props: {
    method: string;
    path: string;
    specUrl: string;
    controllerRef: React.Ref<ScalarModalControllerRef>;
}) {
    return (
        <ApiClientModalProvider
            configuration={{ spec: { url: props.specUrl } }}
            initialRequest={{ path: props.path, method: props.method }}
        >
            <ScalarModalController
                method={props.method}
                path={props.path}
                controllerRef={props.controllerRef}
            />
        </ApiClientModalProvider>
    );
}

type ScalarModalControllerRef = {
    openClient: (() => void) | undefined;
};

function ScalarModalController(props: {
    method: string;
    path: string;
    controllerRef: React.Ref<ScalarModalControllerRef>;
}) {
    const client = useApiClientModal();
    const openClient = client?.open;
    useImperativeHandle(
        props.controllerRef,
        () => ({ openClient: openClient ? () => openClient() : undefined }),
        [openClient]
    );

    // Open the client when the component is mounted.
    const { onOpenClient } = useOpenAPIOperationContext();
    const trackOpening = useEventCallback(() => {
        onOpenClient({ method: props.method, path: props.path });
    });
    useEffect(() => {
        if (openClient) {
            openClient();
            trackOpening();
        }
    }, [openClient]);
    return null;
}
