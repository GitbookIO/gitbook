'use client';

import {
    type ComponentType,
    type ReactNode,
    type Ref,
    useEffect,
    useImperativeHandle,
    useMemo,
} from 'react';

import type { OpenAPIV3_1 } from '@gitbook/openapi-parser';
import { useOpenAPIOperationContext } from './OpenAPIOperationContext';
import { useOpenAPIPrefillContext } from './OpenAPIPrefillContextProvider';
import type { OpenAPIClientContext } from './context';
import type { OpenAPIOperationData } from './types';
import { resolveTryItPrefillForOperation } from './util/tryit-prefill';

export type ScalarModalControllerRef = {
    openClient: (() => void) | undefined;
};

export type ScalarRuntime = {
    ApiClientModalProvider: ComponentType<{
        configuration: object;
        initialRequest: { method: string; path: string };
        children: ReactNode;
    }>;
    useApiClientModal: () => {
        open?: (request: { method: string; path: string; _source?: string }) => void;
    } | null;
};

export type ScalarApiModalProps = {
    method: OpenAPIV3_1.HttpMethods;
    path: string;
    securities: OpenAPIOperationData['securities'];
    servers: OpenAPIOperationData['servers'];
    specUrl: string;
    withProxy: boolean;
    context: OpenAPIClientContext;
    runtime: ScalarRuntime;
    controllerRef: Ref<ScalarModalControllerRef>;
};

/** Loaded only after a reader opens the Try it client. */
export function ScalarApiModal(props: ScalarApiModalProps) {
    const {
        method,
        path,
        securities,
        servers,
        specUrl,
        withProxy,
        context,
        controllerRef,
        runtime,
    } = props;
    const getPrefillInputContextData = useOpenAPIPrefillContext();
    const prefillInputContext = getPrefillInputContextData();

    const prefillConfig = resolveTryItPrefillForOperation({
        operation: { securities, servers },
        prefillInputContext,
    });

    return (
        <runtime.ApiClientModalProvider
            configuration={{
                url: specUrl,
                ...prefillConfig,
                proxyUrl: withProxy ? context.proxyUrl : undefined,
            }}
            initialRequest={{ method: toScalarHttpMethod(method), path }}
        >
            <ScalarModalController
                method={method}
                path={path}
                controllerRef={controllerRef}
                runtime={runtime}
            />
        </runtime.ApiClientModalProvider>
    );
}

function ScalarModalController(props: {
    method: OpenAPIV3_1.HttpMethods;
    path: string;
    controllerRef: Ref<ScalarModalControllerRef>;
    runtime: ScalarRuntime;
}) {
    const { method, path, controllerRef, runtime } = props;
    const client = runtime.useApiClientModal();
    const openScalarClient = client?.open;
    const { onOpenClient: trackClientOpening } = useOpenAPIOperationContext();
    const openClient = useMemo(() => {
        if (openScalarClient) {
            return () => {
                openScalarClient({
                    method: toScalarHttpMethod(method),
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

    useEffect(() => {
        openClient?.();
    }, [openClient]);

    return null;
}

function toScalarHttpMethod<T extends OpenAPIV3_1.HttpMethods>(method: T): Uppercase<T> {
    return method.toUpperCase() as Uppercase<T>;
}
