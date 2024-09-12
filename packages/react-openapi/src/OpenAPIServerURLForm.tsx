'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { OpenAPIClientContext } from './types';
import { OpenAPIV3 } from 'openapi-types';
import { ServerSelector } from './ServerSelector';

export function ServerURLForm(props: {
    children: React.ReactNode;
    context: OpenAPIClientContext;
    servers: OpenAPIV3.ServerObject[];
    serverIndex: number;
}) {
    const { children, context, servers, serverIndex } = props;
    const router = useRouter();
    const [isPending, startTransition] = React.useTransition();
    
    const server = servers[serverIndex];
    const formRef = React.useRef<HTMLFormElement>(null);

    function switchServer(index: number) {
        startTransition(() => {
            if (index !== serverIndex) {
                let params = new URLSearchParams(`block=${context.blockKey}&server=${index ?? '0'}`);
                router.push(`?${params}`, { scroll: false });
            }
        });
    }

    function updateServerVariables(formData: FormData) {
        startTransition(() => {
            let params = new URLSearchParams(`block=${context.blockKey}&server=${formData.get('server') ?? '0'}`);
            const variableKeys = Object.keys(server.variables ?? {});
            for (const pair of formData.entries()) {
                if (variableKeys.includes(pair[0]) && !isNaN(Number(pair[1]))) {
                    params.set(pair[0], `${pair[1]}`);
                }
            }
            router.push(`?${params}`, { scroll: false });
        });
    }

    return (
        <form ref={formRef} action={updateServerVariables} className="contents">
            <fieldset disabled={isPending} className="contents">
                <input type="hidden" name="block" value={context.blockKey} />
                {children}
                { servers.length > 1 ? <ServerSelector servers={servers} currentIndex={serverIndex} onChange={switchServer} /> : null }
            </fieldset>
        </form>
    );
}
