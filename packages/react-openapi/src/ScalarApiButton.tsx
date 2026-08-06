'use client';

import { type ApiClientConfigurationReact, useApiClient } from '@scalar/api-client-react';
import { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useEventCallback } from 'usehooks-ts';

import type { OpenAPIV3_1 } from '@gitbook/openapi-parser';
import { useOpenAPIOperationContext } from './OpenAPIOperationContext';
import { useOpenAPIPrefillContext } from './OpenAPIPrefillContextProvider';
import type { OpenAPIClientContext } from './context';
import { t } from './translate';
import type { OpenAPIOperationData } from './types';
import { resolveTryItPrefillForOperation } from './util/tryit-prefill';

type ScalarModalControllerRef = {
    openClient: () => void;
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
    // useApiClient downloads and mounts the Vue client as soon as it runs, so the controller
    // stays unmounted until the reader actually asks for it.
    const [isMounted, setIsMounted] = useState(false);
    const controllerRef = useRef<ScalarModalControllerRef>(null);

    return (
        <div className="scalar scalar-activate">
            <button
                className="scalar-activate-button button"
                onClick={() => {
                    setIsMounted(true);
                    // No-op on the first click; the controller opens itself once the client resolves.
                    controllerRef.current?.openClient();
                }}
            >
                {t(context.translation, 'test_it')}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 12" fill="currentColor">
                    <path
                        stroke="currentColor"
                        strokeWidth="1.5"
                        d="M1 10.05V1.43c0-.2.2-.31.37-.22l7.26 4.08c.17.1.17.33.01.43l-7.26 4.54a.25.25 0 0 1-.38-.21Z"
                    />
                </svg>
            </button>

            {isMounted ? (
                <ScalarModalController
                    controllerRef={controllerRef}
                    method={method}
                    path={path}
                    proxyUrl={context.proxyUrl}
                    securities={securities}
                    servers={servers}
                    specUrl={specUrl}
                    withProxy={withProxy}
                />
            ) : null}
        </div>
    );
}

/**
 * Drives the shared API client. Renders nothing: the client mounts its own container on
 * document.body and lives there for the rest of the page's life.
 */
function ScalarModalController(props: {
    method: OpenAPIV3_1.HttpMethods;
    path: string;
    securities: OpenAPIOperationData['securities'];
    servers: OpenAPIOperationData['servers'];
    specUrl: string;
    withProxy: boolean;
    proxyUrl?: string;
    controllerRef: React.Ref<ScalarModalControllerRef>;
}) {
    const { method, path, securities, servers, specUrl, withProxy, proxyUrl, controllerRef } =
        props;

    const getPrefillInputContextData = useOpenAPIPrefillContext();
    const { onOpenClient: trackClientOpening } = useOpenAPIOperationContext();

    const resolvedProxyUrl = withProxy ? proxyUrl : undefined;

    // Kept deliberately minimal: this feeds a page-wide singleton, so per-operation
    // authentication and servers are applied imperatively on open instead. proxyUrl belongs
    // here because registering the document fetches the spec through it.
    const configuration = useMemo<ApiClientConfigurationReact>(
        () => ({ url: specUrl, ...(resolvedProxyUrl ? { proxyUrl: resolvedProxyUrl } : {}) }),
        [specUrl, resolvedProxyUrl]
    );

    const client = useApiClient({ configuration });

    // The hook returns a new object and a new open() every render, so it must never land in a
    // dependency array. useEventCallback keeps the latest closure behind a stable identity.
    const openClient = useEventCallback(() => {
        if (!client) {
            return;
        }

        // Options are global to the singleton and every consumer overwrites them, so re-apply
        // this operation's before opening — a sibling operation may have replaced them.
        client.updateOptions(
            {
                ...resolveTryItPrefillForOperation({
                    operation: { securities, servers },
                    prefillInputContext: getPrefillInputContextData(),
                }),
                ...(resolvedProxyUrl ? { proxyUrl: resolvedProxyUrl } : {}),
            },
            true
        );

        client.open({ method, path });
        trackClientOpening({ method, path });
    });

    useImperativeHandle(controllerRef, () => ({ openClient }), [openClient]);

    // This only mounts on the first click, so opening as soon as the client resolves is the
    // deferred answer to that click.
    const isReady = Boolean(client);
    useEffect(() => {
        if (isReady) {
            openClient();
        }
    }, [isReady, openClient]);

    return null;
}
