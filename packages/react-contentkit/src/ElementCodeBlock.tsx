import { ContentKitCodeBlock } from '@gitbook/api';
import React from 'react';

import { ContentKitServerElementProps } from './types';
import { resolveDynamicBinding } from './dynamic';
import { DefaultCodeBlock, ElementCodeBlockClient } from './ElementCodeBlockClient';

export function ElementCodeBlock(props: ContentKitServerElementProps<ContentKitCodeBlock>) {
    const { element, context, state } = props;

    const C = context.codeBlock ?? DefaultCodeBlock;
    const initialCode = resolveDynamicBinding(state, element.content);

    return (
        <ElementCodeBlockClient element={element}>
            <C
                code={initialCode}
                syntax={element.syntax ?? 'plain'}
                lineNumbers={element.lineNumbers ?? true}
            />
        </ElementCodeBlockClient>
    );
}
