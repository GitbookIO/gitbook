import { ContentRef, JSONDocument } from '@gitbook/api';

import { ContentPointer } from '@/lib/api';
import { ResolvedContentRef } from '@/lib/references';
import { ClassValue } from '@/lib/tailwind';

import { Blocks } from './Blocks';

export interface DocumentContext {
    /**
     * Content being rendered.
     */
    content?: ContentPointer;

    /**
     * Resolve a content reference.
     */
    resolveContentRef: (ref: ContentRef) => Promise<ResolvedContentRef | null>;

    /**
     * Transform an ID to be added to the DOM.
     */
    getId?: (id: string) => string;
}

export interface DocumentContextProps {
    context: DocumentContext;
}

/**
 * Render an entire document.
 */
export function DocumentView(
    props: DocumentContextProps & {
        document: JSONDocument;

        /** Style passed to the container */
        style?: ClassValue;

        /** Style passed to all blocks */
        blockStyle?: ClassValue;
    },
) {
    const { document, style, blockStyle = [], context } = props;

    return (
        <Blocks
            nodes={document.nodes}
            document={document}
            ancestorBlocks={[]}
            blockStyle={blockStyle}
            style={[
                style,
                // Preserve adjacent whitespace and new lines.
                'whitespace-pre-wrap',
                // Allow words to break if they are too long.
                'break-words',
            ]}
            context={context}
        />
    );
}
