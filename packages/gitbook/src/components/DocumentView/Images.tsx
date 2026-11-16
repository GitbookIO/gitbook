import type { DocumentBlockImage, DocumentBlockImages, JSONDocument, Length } from '@gitbook/api';

import type { BlockProps } from './Block';
import { Caption, type CaptionAlign } from './Caption';
import type { DocumentContext } from './DocumentView';
import { getCommentAnchorProps } from './utils';
import { Image, type ImageResponsiveSize } from '@/components/utils';
import { type ClassValue, cx } from '@/lib/classnames';
import { resolveContentRefInDocument } from '@/lib/references';

export function Images(props: BlockProps<DocumentBlockImages>) {
    const { document, block, style, context, isEstimatedOffscreen } = props;

    const hasMultipleImages = block.nodes.length > 1;
    const { align = 'center', withFrame } = block.data;

    return (
        <div
            {...getCommentAnchorProps(context, block.key)}
            className={cx(
                style,
                'gb-images',
                align === 'right' && 'gb-images-right',
                align === 'left' && 'gb-images-left'
            )}
        >
            <div
                className={cx(
                    'gb-images-row',
                    hasMultipleImages && 'gb-images-multi',
                    withFrame && 'gb-images-framed'
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
                        align={align}
                    />
                ))}
            </div>
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
    align?: CaptionAlign;
}) {
    const { document, block, context, isEstimatedOffscreen, withFrame, align } = props;

    const [src, darkSrc] = await Promise.all([
        context.contentContext
            ? resolveContentRefInDocument(document, block.data.ref, context.contentContext)
            : null,
        block.data.refDark && context.contentContext
            ? resolveContentRefInDocument(document, block.data.refDark, context.contentContext)
            : null,
    ]);

    if (!src) {
        return null;
    }

    return (
        <div className="gb-image">
            <Caption {...props} fit align={align}>
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
                    loading={isEstimatedOffscreen && context.mode !== 'print' ? 'lazy' : 'eager'}
                    zoom
                    inlineStyle={{
                        maxWidth: '100%',
                        width: getImageDimension(block.data.width, undefined),
                        height: getImageDimension(block.data.height, 'auto'),
                    }}
                    style={
                        withFrame
                            ? 'rounded-xl'
                            : 'rounded-corners:rounded-sm circular-corners:rounded-2xl'
                    }
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
