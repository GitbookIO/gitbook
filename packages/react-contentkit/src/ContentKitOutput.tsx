import { type ContentKitRenderOutput } from '@gitbook/api';
import React from 'react';

import { Element } from './Element';
import { ContentKitServerContext } from './types';

/**
 * Generic component to render a ContentKit output.
 * The component can be used both as a client and server one.
 */
export function ContentKitOutput(props: {
    context: ContentKitServerContext;
    output: ContentKitRenderOutput;
}) {
    const { output, context } = props;
    return (
        <>
            {process.env.NODE_ENV === 'development' ? (
                <pre style={{ display: 'none' }}>{JSON.stringify(props.output, null, 2)}</pre>
            ) : null}
            <Element element={output.element} context={context} state={output.state} />
        </>
    );
}
