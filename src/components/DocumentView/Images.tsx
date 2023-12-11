import { DocumentBlockImage, DocumentBlockImages } from '@gitbook/api';

import { getNodeFragmentByName, isNodeEmpty } from '@/lib/document';
import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { ClassValue, tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';
import { Inlines } from './Inlines';

export function Images(props: BlockProps<DocumentBlockImages>) {
    const { block, style, context } = props;

    return (
        <div
            className={tcls(
                'w-full',
                'flex',
                'flex-row',
                'gap-3',
                block.data.align === 'center' && 'justify-center',
                block.data.align === 'right' && 'justify-end',
                block.data.align === 'left' && 'justify-start',
                style,
                block.data.fullWidth ? 'max-w-screen-2xl' : null,
                'justify-center',
            )}
        >
            {block.nodes.map((node: any, i: number) => (
                <ImageBlock
                    key={node.key}
                    block={node}
                    style={[i > 0 && 'mt-4', style]}
                    siblings={block.nodes.length}
                    context={context}
                />
            ))}
        </div>
    );
}

async function ImageBlock(props: {
    block: DocumentBlockImage;
    style: ClassValue;
    context: ContentRefContext;
    siblings: number;
}) {
    const { block, context } = props;

    const [src, darkSrc] = await Promise.all([
        resolveContentRef(block.data.ref, context),
        block.data.refDark ? resolveContentRef(block.data.refDark, context) : null,
    ]);

    if (!src) {
        return null;
    }

    const imageBorder =
        'relative overflow-hidden rounded after:block after:absolute after:-inset-[0] after:border-dark/2 after:border after:rounded dark:after:border-light/1 dark:after:mix-blend-plus-lighter';

    const caption = getNodeFragmentByName(block, 'caption');
    const captionParagraph = caption?.nodes[0];

    const image = <img alt={block.data.alt} src={src.href} />;

    if (
        !captionParagraph ||
        captionParagraph.type !== 'paragraph' ||
        isNodeEmpty(captionParagraph)
    ) {
        return image;
    }

    return (
        <picture className={tcls('relative')}>
            <div className={tcls(imageBorder)}>{image}</div>
            <figcaption
                className={tcls(
                    'text-sm',
                    'text-center',
                    'mt-2',
                    'text-dark/7',
                    'dark:text-light/6',
                )}
            >
                <Inlines nodes={captionParagraph.nodes} context={context} />
            </figcaption>
        </picture>
    );
}
