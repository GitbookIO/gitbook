'use client';

import { useApiClientModal } from '@scalar/api-client-react';
import React from 'react';
import { OpenAPIOperationData } from './fetchOpenAPIOperation';

/**
 * Button which launches the Scalar API Client
 */
export function ScalarApiButton(props: { data: OpenAPIOperationData }) {
    const client = useApiClientModal();

    return (
        <div className="scalar scalar-activate">
            <button
                className="scalar-activate-button"
                onClick={() => client?.open({ path: props.data.path, method: props.data.method })}
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
