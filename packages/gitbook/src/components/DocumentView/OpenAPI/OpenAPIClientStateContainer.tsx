'use client';

import { DocumentBlock } from '@gitbook/api';
import { OpenAPIClientState } from '@gitbook/react-openapi/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { OpenAPIV3 } from 'openapi-types';
import * as React from 'react';

/**
 * Client component that wraps `OpenAPIClientState` so we can
 * use some hooks (e.g. useRouter) in the `onUpdate` callback.
 */
export default function OpenAPIClientStateContainer(props: {
    children: React.ReactNode;
    block: DocumentBlock;
    servers: OpenAPIV3.ServerObject[];
}) {
    const { block, children, servers } = props;
    const [isPending, startTransition] = React.useTransition();
    const router = useRouter();
    const searchParams = useSearchParams();

    return (
        <OpenAPIClientState
            isPending={isPending}
            servers={servers}
            params={
                searchParams.get('block') === block.key
                    ? Object.fromEntries(searchParams.entries())
                    : undefined
            }
            onUpdate={async (params) => {
                startTransition(() => {
                    const queryParams = new URLSearchParams(params ?? '');
                    router.replace(`?${queryParams}`, { scroll: false });
                });
            }}
        >
            {children}
        </OpenAPIClientState>
    );
}
