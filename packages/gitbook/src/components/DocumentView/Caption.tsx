import type {
    DocumentBlockDrawing,
    DocumentBlockEmbed,
    DocumentBlockFile,
    DocumentBlockImage,
    JSONDocument,
} from '@gitbook/api';

import { getNodeFragmentByName, isNodeEmpty } from '@/lib/document';
import { type ClassValue, tcls } from '@/lib/tailwind';

import type { DocumentContextProps } from './DocumentView';
import { Inlines } from './Inlines';

/**
 * Wrap a content of a block that has a potential caption.
 */
export function Caption(
    props: {
        children: React.ReactNode;
        document: JSONDocument;
        style?: ClassValue;
        fit?: boolean;
        wrapperStyle?: ClassValue;
        block: DocumentBlockImage | DocumentBlockDrawing | DocumentBlockEmbed | DocumentBlockFile;
        withBorder?: boolean;
        withFrame?: boolean;
    } & DocumentContextProps
) {
    const {
        children,
        document,
        block,
        context,
        fit = false,
        withBorder = false,
        withFrame = false,
        wrapperStyle = [
            'relative',
            'overflow-hidden',
            'after:block',
            'after:absolute',
            'after:-inset-0',
            'after:pointer-events-none',
            fit ? 'w-fit' : null,
            withBorder
                ? 'rounded-corners:rounded-sm circular-corners:rounded-2xl after:border-tint-subtle after:border after:rounded circular-corners:after:rounded-2xl rounded-corners:after:rounded-sm dark:after:mix-blend-plus-lighter after:pointer-events-none'
                : null,
            withFrame && 'p-2',
        ],
        style,
    } = props;

    const caption = getNodeFragmentByName(block, 'caption');
    const captionParagraph = caption?.nodes[0];

    if (
        !captionParagraph ||
        captionParagraph.type !== 'paragraph' ||
        isNodeEmpty(captionParagraph)
    ) {
        return <div className={tcls(style, wrapperStyle)}>{children}</div>;
    }

    return (
        <picture className={tcls('relative', style)}>
            <div className={tcls(wrapperStyle, 'mx-auto')}>{children}</div>
            <figcaption
                className={tcls(
                    'text-xs',
                    'text-center',
                    'text-tint',
                    withFrame ? 'mt-0.5 mb-2.5' : 'mt-2'
                )}
            >
                <Inlines
                    nodes={captionParagraph.nodes}
                    document={document}
                    context={context}
                    ancestorInlines={[]}
                />
            </figcaption>
        </picture>
    );
}
