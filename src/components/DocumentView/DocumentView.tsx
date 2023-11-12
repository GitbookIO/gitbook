import { JSONDocument } from '@gitbook/api';

import { ContentRefContext } from '@/lib/references';
import { ClassValue } from '@/lib/tailwind';

import { Blocks } from './Blocks';

export interface DocumentContextProps {
    context: ContentRefContext;
}

/**
 * Render an entire document.
 */
export function DocumentView(
    props: DocumentContextProps & {
        document: JSONDocument;
        style?: ClassValue;
    },
) {
    const { document, style, ...context } = props;

    return (
        <Blocks
            nodes={document.nodes}
            ancestorBlocks={[]}
            blockStyle={'mt-6'}
            style={style}
            {...context}
        />
    );
}
