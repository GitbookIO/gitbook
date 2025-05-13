import type { GitBookSiteContext } from '@v2/lib/context';
import type React from 'react';

import { TableOfContents } from './TableOfContents';
import { TableOfContentsScript } from './TableOfContentsScript';

/**
 * Wrapper component that includes both the server-rendered TableOfContents
 * and the client-side script to manage its position/height dynamically
 */
export function AdaptiveTableOfContents(props: {
    context: GitBookSiteContext;
    header?: React.ReactNode;
    innerHeader?: React.ReactNode;
}) {
    return (
        <>
            <TableOfContents {...props} />
            <TableOfContentsScript />
        </>
    );
}
