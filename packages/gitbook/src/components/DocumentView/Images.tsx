import type { DocumentBlockImage, DocumentBlockImages, JSONDocument, Length } from '@gitbook/api';

import { Image, type ImageResponsiveSize } from '@/components/utils';
import { resolveContentRef } from '@/lib/references';
import { type ClassValue, tcls } from '@/lib/tailwind';

import type { BlockProps } from './Block';
import { Caption } from './Caption';
import type { DocumentContext } from './DocumentView';

export function Images(props: BlockProps<DocumentBlockImages>) {
    const { document, block, style, context, isEstimatedOffscreen } = props;

    const hasMultipleImages = block.nodes.length > 1;
    const { align = 'center', withFrame } = block.data;

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
                hasMultipleImages && ['grid', 'grid-flow-col'],
                withFrame && [
                    'rounded-2xl',
                    'border',
                    'border-[rgb(234,235,238)]',
                    'dark:border-[rgb(45,50,58)]',
                    'relative',
                    'overflow-hidden',
                ]
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
                    withFrame={withFrame}
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
    withFrame?: boolean;
}) {
    const { block, context, isEstimatedOffscreen, withFrame } = props;

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
        <div className={tcls('relative', 'overflow-hidden')}>
            {/* Frame grid */}
            {withFrame && (
                <div
                    className={tcls(
                        'absolute',
                        '-top-0.5',
                        '-left-0.5',
                        'right-px',
                        'bottom-px',
                        'opacity-40',
                        'dark:opacity-[0.1]',
                        'bg-[length:24px_24px,24px_24px]',
                        'bg-[linear-gradient(to_right,_rgb(234,235,238)_1px,_transparent_1px),linear-gradient(to_bottom,_rgb(234,235,238)_1px,_transparent_1px)]',
                        'dark:bg-[linear-gradient(to_right,_rgb(122,128,139)_1px,_transparent_1px),linear-gradient(to_bottom,_rgb(122,128,139)_1px,_transparent_1px)]',
                        'bg-repeat'
                    )}
                />
            )}

            {/* Shadow overlay */}
            {withFrame && (
                <div
                    className={tcls(
                        'pointer-events-none absolute inset-0 rounded-2xl',
                        'shadow-[inset_0_0_10px_10px_rgba(255,255,255,0.9)]',
                        'dark:shadow-[inset_0_0_10px_10px_rgb(29,29,29)]'
                    )}
                />
            )}

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
                    style={withFrame ? 'rounded-xl' : undefined}
                />
            </Caption>
        </div>
    );
}

/**
 * This function converts a dimension value to a string representation with 'px' as the unit,
 * or returns the default value if the dimension is not valid.
 * When using absolute values, the converted dimension will be the actual size in pixels.
 * When using relative values, the converted dimension will be relative to the parent element's size.
 */
function getImageDimension<DefaultValue>(
    dimension: Length | undefined,
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
