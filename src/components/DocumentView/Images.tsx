import {
    DocumentBlockImage,
    DocumentBlockImageDimension,
    DocumentBlockImages,
    JSONDocument,
} from '@gitbook/api';

import { Image, ImageResponsiveSize } from '@/components/utils';
import { ClassValue, tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';
import { Caption } from './Caption';
import { DocumentContext } from './DocumentView';
import { isBlockOffscreen } from './utils';

export function Images(props: BlockProps<DocumentBlockImages>) {
    const { document, block, ancestorBlocks, style, context } = props;

    const isOffscreen = isBlockOffscreen({ document, block, ancestorBlocks });
    const isMultipleImages = block.nodes.length > 1;
    const { align = 'center' } = block.data;

    return (
        <div
            className={tcls(
                style,
                'flex',
                'flex-row',
                'gap-3',
                align === 'center' && 'justify-center',
                align === 'right' && 'justify-end',
                align === 'left' && 'justify-start',
                isMultipleImages && ['grid', 'grid-flow-col', 'max-w-none'],
                block.data.fullWidth ? 'max-w-screen-2xl' : null,
            )}
        >
            {block.nodes.map((node: any, i: number) => (
                <ImageBlock
                    key={node.key}
                    block={node}
                    document={document}
                    style={[]}
                    siblings={block.nodes.length}
                    context={context}
                    isOffscreen={isOffscreen}
                />
            ))}
        </div>
    );
}

/**
 * Sizes for image blocks.
 */
export const imageBlockSizes: ImageResponsiveSize[] = [
    {
        media: '(max-width: 640px)',
        width: 400,
    },
    {
        width: 768,
    },
];

async function ImageBlock(props: {
    block: DocumentBlockImage;
    document: JSONDocument;
    style: ClassValue;
    context: DocumentContext;
    siblings: number;
    isOffscreen: boolean;
}) {
    const { block, context, isOffscreen } = props;

    const [src, darkSrc] = await Promise.all([
        context.resolveContentRef(block.data.ref),
        block.data.refDark ? context.resolveContentRef(block.data.refDark) : null,
    ]);

    if (!src) {
        return null;
    }

    return (
        <Caption {...props}>
            <Image
                alt={block.data.alt ?? ''}
                sizes={imageBlockSizes}
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
                zoom
                inlineStyle={{
                    maxWidth: '100%',
                    width: getImageDimension(block.data.width, undefined),
                    height: getImageDimension(block.data.height, 'auto'),
                }}
            />
        </Caption>
    );
}

/**
 * This function converts a dimension value to a string representation with 'px' as the unit,
 * or returns the default value if the dimension is not valid.
 * When using absolute values, the converted dimension will be the actual size in pixels.
 * When using relative values, the converted dimension will be relative to the parent element's size.
 */
function getImageDimension<DefaultValue>(
    dimension: DocumentBlockImageDimension | undefined,
    defaultValue: DefaultValue,
): string | DefaultValue {
    if (typeof dimension === 'number') {
        return `${dimension}px`;
    } else if (dimension?.unit === 'px') {
        return `${dimension.value}${dimension.unit}`;
    } else {
        return defaultValue;
    }
}
