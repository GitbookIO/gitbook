import { ContentRef, JSONDocument } from '@gitbook/api';

import { ContentTarget } from '@/lib/api';
import { ContentRefContext, ResolveContentRefOptions, ResolvedContentRef } from '@/lib/references';
import { ClassValue } from '@/lib/tailwind';

import { Blocks } from './Blocks';

export interface DocumentContext {
    /**
     * Mode to render the document in.
     * This can be used to render the document in a different mode, such as "default" or "print".
     */
    mode: 'default' | 'print';

    /**
     * Space content being rendered.
     */
    content?: ContentTarget;

    /**
     * The context for resolving content refs.
     * If null, content refs cannot be resolved.
     */
    contentRefContext: ContentRefContext | null;

    /**
     * Resolve a content reference.
     */
    resolveContentRef: (
        ref: ContentRef,
        options?: ResolveContentRefOptions,
    ) => Promise<ResolvedContentRef | null>;

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
            ]}
            context={context}
        />
    );
}
