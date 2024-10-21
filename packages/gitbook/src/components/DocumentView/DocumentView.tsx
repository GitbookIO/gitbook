import { ContentRef, JSONDocument } from '@gitbook/api';

import { ContentTarget } from '@/lib/api';
import { ContentRefContext, ResolveContentRefOptions, ResolvedContentRef } from '@/lib/references';
import { ClassValue } from '@/lib/tailwind';

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

    /**
     * Returns true if the given code block should be highlighted.
     * This function was added to protect against memory issues when highlighting
     * a large number of code blocks.
     * Once highlighting can scale up to a large number of code blocks, it can be removed.
     *
     * https://linear.app/gitbook-x/issue/RND-3588/gitbook-open-code-syntax-highlighting-runs-out-of-memory-after-a
     */
    shouldHighlightCode: (spaceId: string | undefined) => boolean;

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

/**
 * Placeholder for the entire document layout.
 */
export function DocumentViewSkeleton(props: { document: JSONDocument; blockStyle: ClassValue }) {
    const { document, blockStyle } = props;

    return (
        <div className="flex flex-col gap-4">
            {document.nodes.map((block, index) => (
                <BlockSkeleton
                    key={block.key!}
                    block={block}
                    style={[
                        'w-full mx-auto decoration-primary/6',
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
