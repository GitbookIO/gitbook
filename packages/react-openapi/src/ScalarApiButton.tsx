'use client';

import { ApiClientModalProvider, useApiClientModal } from '@scalar/api-client-react';
import { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { OpenAPIV3_1 } from '@gitbook/openapi-parser';
import { useOpenAPIOperationContext } from './OpenAPIOperationContext';
import { useOpenAPIPrefillContext } from './OpenAPIPrefillContextProvider';
import type { OpenAPIClientContext } from './context';
import { t } from './translate';
import type { OpenAPIOperationData } from './types';
import { resolveTryItPrefillForOperation } from './util/tryit-prefill';

/**
 * Button which launches the Scalar API Client
 */
export function ScalarApiButton(props: {
    method: OpenAPIV3_1.HttpMethods;
    path: string;
    securities: OpenAPIOperationData['securities'];
    servers: OpenAPIOperationData['servers'];
    specUrl: string;
    context: OpenAPIClientContext;
}) {
    const { method, path, securities, servers, specUrl, context } = props;
    const getPrefillInputContextData = useOpenAPIPrefillContext();
    const [isOpen, setIsOpen] = useState(false);
    const [prefillInputContext, setPrefillInputContext] = useState<Record<string, unknown> | null>(
        null
    );
    const controllerRef = useRef<ScalarModalControllerRef>(null);

    // Fetch visitor data and open modal
    const openModal = async () => {
        const data = await getPrefillInputContextData();
        console.log('!!Fetched data', data);
        setPrefillInputContext(data);
        controllerRef.current?.openClient?.();
        setIsOpen(true);
    };

    return (
        <div className="scalar scalar-activate">
            <button className="scalar-activate-button button" onClick={openModal}>
                {t(context.translation, 'test_it')}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 12" fill="currentColor">
                    <path
                        stroke="currentColor"
                        strokeWidth="1.5"
                        d="M1 10.05V1.43c0-.2.2-.31.37-.22l7.26 4.08c.17.1.17.33.01.43l-7.26 4.54a.25.25 0 0 1-.38-.21Z"
                    />
                </svg>
            </button>

            {isOpen &&
                prefillInputContext &&
                createPortal(
                    <ScalarModal
                        controllerRef={controllerRef}
                        method={method}
                        path={path}
                        securities={securities}
                        servers={servers}
                        specUrl={specUrl}
                        prefillInputContext={prefillInputContext}
                    />,
                    document.body
                )}
        </div>
    );
}

function ScalarModal(props: {
    method: OpenAPIV3_1.HttpMethods;
    path: string;
    securities: OpenAPIOperationData['securities'];
    servers: OpenAPIOperationData['servers'];
    specUrl: string;
    controllerRef: React.Ref<ScalarModalControllerRef>;
    prefillInputContext: Record<string, unknown>;
}) {
    const { method, path, securities, servers, specUrl, controllerRef, prefillInputContext } =
        props;

    const prefillConfig = resolveTryItPrefillForOperation({
        operation: { securities, servers },
        prefillInputContext,
    });
    console.log('!!prefillConfig', prefillConfig);

    return (
        <ApiClientModalProvider
            configuration={{ url: specUrl, ...prefillConfig }}
            initialRequest={{ method, path }}
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
    const openScalarClient = client?.open;
    const { onOpenClient: trackClientOpening } = useOpenAPIOperationContext();
    const openClient = useMemo(() => {
        if (openScalarClient) {
            return () => {
                openScalarClient({
                    method,
                    path,
                    _source: 'gitbook',
                });
                trackClientOpening({ method, path });
            };
        }
        return null;
    }, [openScalarClient, method, path, trackClientOpening]);
    useImperativeHandle(
        controllerRef,
        () => ({ openClient: openClient ? () => openClient() : undefined }),
        [openClient]
    );

    // Open at mount
    useEffect(() => {
        openClient?.();
    }, [openClient]);
    return null;
}
