import type { ContentKitCodeBlock } from '@gitbook/api';
import type React from 'react';

import type { ContentKitClientElementProps } from './types';

export function ElementCodeBlockClient(
    props: ContentKitClientElementProps<ContentKitCodeBlock> & {
        /**
         * Render a code block on the server as a fallback and swap only when needed.
         */
        children: React.ReactNode;
    }
) {
    const { children } = props;

    return <>{children}</>;
}

export function DefaultCodeBlock(props: {
    code: string;
    syntax: string;
    lineNumbers: number | boolean;
}) {
    return (
        <pre>
            <code>{props.code}</code>
        </pre>
    );
}
