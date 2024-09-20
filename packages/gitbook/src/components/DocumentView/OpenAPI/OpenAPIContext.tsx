'use client';

import { DocumentBlock } from '@gitbook/api';
import { OpenAPIOperationData } from '@gitbook/react-openapi';
import { OpenAPIContextProvider } from '@gitbook/react-openapi/client';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

export default function OpenAPIContext(props: {
    children: React.ReactNode;
    block: DocumentBlock;
    data: OpenAPIOperationData;
}) {
    const { block, children, data } = props;
    const [isPending, startTransition] = React.useTransition();
    const router = useRouter();
    const searchParams = useSearchParams();

    return (
        <OpenAPIContextProvider
            isPending={isPending}
            data={data}
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
        </OpenAPIContextProvider>
    );
}
