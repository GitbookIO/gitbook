import { DocumentBlockImage, DocumentBlockImages, JSONDocument } from '@gitbook/api';

import { Image } from '@/components/utils';
import { getNodeFragmentByName, isNodeEmpty } from '@/lib/document';
import { ClassValue, tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';
import { DocumentContext } from './DocumentView';
import { Inlines } from './Inlines';
import { isBlockOffscreen } from './utils';

export function Images(props: BlockProps<DocumentBlockImages>) {
    const { document, block, ancestorBlocks, style, context } = props;

    const isOffscreen = isBlockOffscreen({ document, block, ancestorBlocks });

    const isMultipleImages = block.nodes.length > 1;

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
                isMultipleImages && ['grid', 'grid-flow-col', 'max-w-none'],
                block.data.fullWidth ? 'max-w-screen-2xl' : null,
                'justify-center',
            )}
        >
            {block.nodes.map((node: any, i: number) => (
                <ImageBlock
                    key={node.key}
                    block={node}
                    document={document}
                    style={[i > 0 && 'mt-4', style]}
                    siblings={block.nodes.length}
                    context={context}
                    isOffscreen={isOffscreen}
                />
            ))}
        </div>
    );
}

async function ImageBlock(props: {
    block: DocumentBlockImage;
    document: JSONDocument;
    style: ClassValue;
    context: DocumentContext;
    siblings: number;
    isOffscreen: boolean;
}) {
    const { block, document, context, isOffscreen } = props;

    const [src, darkSrc] = await Promise.all([
        context.resolveContentRef(block.data.ref),
        block.data.refDark ? context.resolveContentRef(block.data.refDark) : null,
    ]);

    if (!src) {
        return null;
    }

    const imageBorder = tcls(
        'relative',
        'overflow-hidden',
        'rounded',
        'after:block',
        'after:absolute',
        'after:-inset-[0]',
        'after:border-dark/2',
        'after:border',
        'after:rounded',
        'dark:after:border-light/1',
        'dark:after:mix-blend-plus-lighter',
        'after:pointer-events-none',
    );

    const caption = getNodeFragmentByName(block, 'caption');
    const captionParagraph = caption?.nodes[0];

    const image = (
        <Image
            alt={block.data.alt ?? ''}
            sizes={[
                {
                    media: '(max-width: 640px)',
                    width: 400,
                },
                {
                    width: 768,
                },
            ]}
            sources={{
                light: {
                    src: src.href,
                    size: src.fileDimensions,
                },
                dark: darkSrc
                    ? {
                          src: darkSrc.href,
                          size: darkSrc.fileDimensions,
                      }
                    : null,
            }}
            priority={isOffscreen ? 'lazy' : 'high'}
            preload
        />
    );

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
                <Inlines nodes={captionParagraph.nodes} document={document} context={context} />
            </figcaption>
        </picture>
    );
}
