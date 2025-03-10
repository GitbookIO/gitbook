import type { ClassValue } from '@/lib/tailwind';
import type { JSONDocument } from '@gitbook/api';
import type { GitBookAnyContext } from '@v2/lib/context';

import { BlockSkeleton } from './Block';
import { Blocks } from './Blocks';

export interface DocumentContext {
    /**
     * Mode to render the document in.
     * This can be used to render the document in a different mode, such as "default" or "print".
     */
    mode: 'default' | 'print';

    /**
     * Space content being rendered.
     * If null, content refs cannot be resolved.
     */
    contentContext?: GitBookAnyContext;

    /**
     * Transform an ID to be added to the DOM.
     */
    getId?: (id: string) => string;

    /**
     * True if the blocks should be wrapped in suspense boundary for isolated loading skeletons.
     * @default true
     */
    wrapBlocksInSuspense?: boolean;
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

        /** True if the document should be considered offscreen */
        isOffscreen?: boolean;
    }
) {
    const { document, style, blockStyle = [], context, isOffscreen = false } = props;

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
            isOffscreen={isOffscreen}
        />
    );
}

/**
 * Placeholder for the entire document layout.
 */
export function DocumentViewSkeleton(props: { document: JSONDocument; blockStyle: ClassValue }) {
    const { document, blockStyle } = props;

    return (
        <div className="flex flex-col gap-4">
            {document.nodes.map((block) => (
                <BlockSkeleton
                    key={block.key!}
                    block={block}
                    style={[
                        'mx-auto w-full decoration-primary/6',
                        block.data && 'fullWidth' in block.data && block.data.fullWidth
                            ? 'max-w-screen-xl'
                            : 'max-w-3xl',
                        blockStyle,
                    ]}
                />
            ))}
        </div>
    );
}
