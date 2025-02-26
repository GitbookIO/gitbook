import type {
    DocumentBlockImage,
    DocumentBlockImageDimension,
    DocumentBlockImages,
    JSONDocument,
} from '@gitbook/api';

import { Image, type ImageResponsiveSize } from '@/components/utils';
import { resolveContentRef } from '@/lib/references';
import { type ClassValue, tcls } from '@/lib/tailwind';

import type { BlockProps } from './Block';
import { Caption } from './Caption';
import type { DocumentContext } from './DocumentView';

export function Images(props: BlockProps<DocumentBlockImages>) {
    const { document, block, style, context, isEstimatedOffscreen } = props;

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
                isMultipleImages && ['grid', 'grid-flow-col', 'max-w-none']
            )}
        >
            {block.nodes.map((node: any, _i: number) => (
                <ImageBlock
                    key={node.key}
                    block={node}
                    document={document}
                    style={[]}
                    siblings={block.nodes.length}
                    context={context}
                    isEstimatedOffscreen={isEstimatedOffscreen}
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
    isEstimatedOffscreen: boolean;
}) {
    const { block, context, isEstimatedOffscreen } = props;

    const [src, darkSrc] = await Promise.all([
        context.contentContext ? resolveContentRef(block.data.ref, context.contentContext) : null,
        block.data.refDark && context.contentContext
            ? resolveContentRef(block.data.refDark, context.contentContext)
            : null,
    ]);

    if (!src) {
        return null;
    }

    return (
        <Caption {...props} fit>
            <Image
                alt={block.data.alt ?? ''}
                sizes={imageBlockSizes}
                resize={context.contentContext?.imageResizer}
                sources={{
                    light: {
                        src: src.href,
                        size: src.file?.dimensions,
                    },
                    dark: darkSrc
                        ? {
                              src: darkSrc.href,
                              size: darkSrc.file?.dimensions,
                          }
                        : null,
                }}
                priority={isEstimatedOffscreen ? 'lazy' : 'high'}
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
    defaultValue: DefaultValue
): string | DefaultValue {
    if (typeof dimension === 'number') {
        return `${dimension}px`;
    }
    if (dimension?.unit === 'px') {
        return `${dimension.value}${dimension.unit}`;
    }
    return defaultValue;
}
