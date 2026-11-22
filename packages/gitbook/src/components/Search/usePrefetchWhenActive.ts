import { PrefetchKind } from 'next/dist/client/components/router-reducer/router-reducer-types';
import { useRouter } from 'next/navigation';
import React from 'react';

import { defaultIsExternalClient, hasSideEffectQueryParams, LinkContext } from '../primitives';
import { isExternalLink, isSiteAuthLink } from '../utils/link';

const RESULT_PREFETCH_DELAY_MS = 200;

export function usePrefetchWhenActive(href: string, active: boolean) {
    const router = useRouter();
    const { isExternalServer = isExternalLink, isExternalClient = defaultIsExternalClient } =
        React.useContext(LinkContext);

    React.useEffect(() => {
        if (
            !active ||
            isExternalServer(href) ||
            isSiteAuthLink(href) ||
            hasSideEffectQueryParams(href) ||
            (window.self !== window.top && isExternalClient(href))
        ) {
            return;
        }

        const timeout = setTimeout(
            () => router.prefetch(href, { kind: PrefetchKind.FULL }),
            RESULT_PREFETCH_DELAY_MS
        );
        return () => clearTimeout(timeout);
    }, [active, href, isExternalClient, isExternalServer, router]);
}
