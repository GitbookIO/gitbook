import {
    DocumentBlockDrawing,
    DocumentBlockEmbed,
    DocumentBlockImage,
    JSONDocument,
} from '@gitbook/api';

import { getNodeFragmentByName, isNodeEmpty } from '@/lib/document';
import { ClassValue, tcls } from '@/lib/tailwind';

import { DocumentContextProps } from './DocumentView';
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
        block: DocumentBlockImage | DocumentBlockDrawing | DocumentBlockEmbed;
    } & DocumentContextProps,
) {
    const {
        children,
        document,
        block,
        context,
        fit = false,
        wrapperStyle = [
            'relative',
            'overflow-hidden',
            'rounded',
            'straight-corners:rounded-none',
            'after:block',
            'after:absolute',
            'after:-inset-[0]',
            'after:border-dark/2',
            'after:border',
            'after:rounded',
            'straight-corners:after:rounded-none',
            'dark:after:border-light/1',
            'dark:after:mix-blend-plus-lighter',
            'after:pointer-events-none',
            fit ? 'w-fit' : null,
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
                    'text-sm',
                    'text-center',
                    'mt-2',
                    'text-dark/7',
                    'dark:text-light/6',
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
