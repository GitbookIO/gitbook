import { DocumentBlockImage, DocumentBlockImages, JSONDocument } from '@gitbook/api';

import { Image } from '@/components/utils';
import { ClassValue, tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';
import { Caption } from './Caption';
import { DocumentContext } from './DocumentView';
import { isBlockOffscreen } from './utils';

export function Images(props: BlockProps<DocumentBlockImages>) {
    const { document, block, ancestorBlocks, style, context } = props;

    const isOffscreen = isBlockOffscreen({ document, block, ancestorBlocks });

    const isMultipleImages = block.nodes.length > 1;

    return (
        <div
            className={tcls(
                style,
                'flex',
                'flex-row',
                'gap-3',
                block.data.align === 'center' && 'justify-center',
                block.data.align === 'right' && 'justify-end',
                block.data.align === 'left' && 'justify-start',
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
                    style={[]}
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
                zoom
            />
        </Caption>
    );
}
