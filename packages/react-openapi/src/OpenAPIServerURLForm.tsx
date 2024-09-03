'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { OpenAPIClientContext } from './types';
import { OpenAPIV3 } from 'openapi-types';
import { useApiClientModal } from '@scalar/api-client-react';

export function ServerURLForm(props: {
    children: React.ReactNode;
    context: OpenAPIClientContext;
    server: OpenAPIV3.ServerObject;
}) {
    const { children, context, server } = props;
    const router = useRouter();
    const client = useApiClientModal();
    const [isPending, startTransition] = React.useTransition();

    function updateServerUrl(formData: FormData) {
        startTransition(() => {
            if (!server.variables) {
                return;
            }
            let params = new URLSearchParams(`block=${context.blockKey}`);
            const variableKeys = Object.keys(server.variables);
            for (const pair of formData.entries()) {
                if (variableKeys.includes(pair[0]) && !isNaN(Number(pair[1]))) {
                    params.set(pair[0], `${pair[1]}`);
                }
            }
            router.push(`?${params}`, { scroll: false });
        });
    }

    return (
        <form action={updateServerUrl} className="contents">
            <fieldset disabled={isPending} className="contents">
                <input type="hidden" name="block" value={context.blockKey} />
                <span>{children}</span>
            </fieldset>
        </form>
    );
}
