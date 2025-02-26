import type { ContentKitCodeBlock } from '@gitbook/api';

import { DefaultCodeBlock, ElementCodeBlockClient } from './ElementCodeBlockClient';
import { resolveDynamicBinding } from './dynamic';
import type { ContentKitServerElementProps } from './types';

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
