import type { GitBookBaseContext } from '@/lib/context';
import type { DocumentInlineImage } from '@gitbook/api';
import assertNever from 'assert-never';

import { type ResolvedContentRef, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { Image } from '../utils';
import type { InlineProps } from './Inline';

export async function InlineImage(props: InlineProps<DocumentInlineImage>) {
    const { inline, context, ancestorInlines } = props;
    const { size = 'original' } = inline.data;

    const [src, darkSrc] = await Promise.all([
        context.contentContext ? resolveContentRef(inline.data.ref, context.contentContext) : null,
        inline.data.refDark && context.contentContext
            ? resolveContentRef(inline.data.refDark, context.contentContext)
            : null,
    ]);

    if (!src) {
        return null;
    }

    const isInLink = ancestorInlines.some((ancestor) => ancestor.type === 'link');
    const sizes = await getImageSizes(context.contentContext, size, src);

    return (
        /* Ensure images dont expand to the size of the container where this Image may be nested in. Now it's always nested in a size-restricted container */
        <span
            className={tcls(
                size !== 'line' ? ['inline-flex', 'max-w-[300px]', 'align-middle'] : null
            )}
        >
            <Image
                alt={inline.data.alt ?? inline.data.caption ?? ''}
                sizes={sizes}
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
                priority="lazy"
                preload
                style={[size === 'line' ? ['max-h-lh', 'h-lh', 'w-auto'] : null]}
                inline
                zoom={!isInLink}
            />
        </span>
    );
}

async function getImageSizes(
    context: GitBookBaseContext | undefined,
    size: 'original' | 'line',
    src: ResolvedContentRef
) {
    switch (size) {
        case 'line': {
            const imageSize =
                src.file?.dimensions ??
                (await context?.imageResizer?.getImageSize(src.href, {
                    dpr: 3,
                }));
            // We estimate that the maximum height of the line will be 40px
            // and from the aspect-ratio, we can deduce the width
            const lineHeight = 40;

            const aspectRatio = imageSize ? imageSize.width / imageSize.height : 1;

            return [
                {
                    width: Math.floor(lineHeight * aspectRatio),
                },
            ];
        }
        case 'original': {
            // The max-width is 300px
            return [
                {
                    // if we know the image size and it is smaller than 300px use its width
                    width: 300,
                },
            ];
        }
        default:
            assertNever(size);
    }
}
