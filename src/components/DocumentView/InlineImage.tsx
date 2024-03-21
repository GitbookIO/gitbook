import { DocumentInlineImage } from '@gitbook/api';
import assertNever from 'assert-never';

import { getImageSize } from '@/lib/images';
import { ResolvedContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { InlineProps } from './Inline';
import { Image } from '../utils';

export async function InlineImage(props: InlineProps<DocumentInlineImage>) {
    const { inline, context } = props;
    const { size = 'original' } = inline.data;

    const [src, darkSrc] = await Promise.all([
        context.resolveContentRef(inline.data.ref),
        inline.data.refDark ? context.resolveContentRef(inline.data.refDark) : null,
    ]);

    if (!src) {
        return null;
    }

    return (
        /* Ensure images dont expand to the size of the container where this Image may be nested in. Now it's always nested in a size-restricted container */
        <span className={tcls(size !== 'line' ? ['inline-flex', 'max-w-[300px]'] : null)}>
            <Image
                alt={inline.data.caption ?? ''}
                sizes={await getImageSizes(size, src)}
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
                priority="lazy"
                preload
                style={[size === 'line' ? ['max-h-[1lh]', 'h-[1lh]', 'w-auto'] : null]}
                inline
                zoom
            />
        </span>
    );
}

async function getImageSizes(size: 'original' | 'line', src: ResolvedContentRef) {
    switch (size) {
        case 'line': {
            const imageSize =
                src.fileDimensions ??
                (await getImageSize(src.href, {
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
