import { DocumentInlineImage } from '@gitbook/api';

import { InlineProps } from './Inline';
import { Image } from '../utils';

export async function InlineImage(props: InlineProps<DocumentInlineImage>) {
    const { inline, context } = props;

    const [src, darkSrc] = await Promise.all([
        context.resolveContentRef(inline.data.ref),
        inline.data.refDark ? context.resolveContentRef(inline.data.refDark) : null,
    ]);

    if (!src) {
        return null;
    }

    return (
        <Image
            alt={inline.data.caption ?? ''}
            sizes={
                inline.data.size === 'original'
                    ? [
                          {
                              width: 300,
                          },
                      ]
                    : [
                          {
                              // Estimate of common images as max-height is 1.6em
                              width: 64,
                          },
                      ]
            }
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
            style={[
                inline.data.size === 'original'
                    ? 'max-w-[300px]'
                    : ['max-h-[1.6em]', 'h-[1.6em]', 'w-auto'],
            ]}
            inline
        />
    );
}
