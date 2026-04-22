'use client';

import type { OpenAPIV3_1 } from '@gitbook/openapi-parser';
import { useApiClient } from '@scalar/api-client-react';
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
    withProxy: boolean;
    context: OpenAPIClientContext;
}) {
    const { method, path, securities, servers, specUrl, withProxy, context } = props;

    const getPrefillInputContextData = useOpenAPIPrefillContext();
    const prefillInputContext = getPrefillInputContextData();

    const prefillConfig = resolveTryItPrefillForOperation({
        operation: { securities, servers },
        prefillInputContext,
    });

    console.log('prefillConfig', prefillConfig);

    const client = useApiClient({
        configuration: {
            url: specUrl,
            ...prefillConfig,
            proxyUrl: 'https://proxy.scalar.com',
            // proxyUrl: withProxy ? context.proxyUrl : undefined,
        },
    });

    console.log('rendering');

    return (
        <div className="scalar scalar-activate">
            <button
                className="scalar-activate-button button"
                onClick={() => client?.open({ method, path })}
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
        </div>
    );
}
