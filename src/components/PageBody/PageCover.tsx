import { RevisionPageDocument, RevisionPageDocumentCover } from '@gitbook/api';

import { Image, ImageSize } from '@/components/utils';
import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import defaultPageCover from './default-page-cover.svg';
import { PAGE_COVER_HEIGHT } from '../layout';

const PAGE_COVER_SIZE: ImageSize = { width: 1990, height: 480 };

/**
 * Cover for the page.
 */
export async function PageCover(props: {
    as: 'hero' | 'full';
    page: RevisionPageDocument;
    cover: RevisionPageDocumentCover;
    context: ContentRefContext;
}) {
    const { as, page, cover, context } = props;
    const resolved = cover.ref ? await resolveContentRef(cover.ref, context) : null;

    return (
        <div
            className={tcls(
                'overflow-hidden',
                // Negative margin to balance the container padding
                '-mx-4',
                as === 'full'
                    ? [
                          'sm:-mx-6',
                          'md:-mx-8',
                          '-lg:mr-8',
                          page.layout.tableOfContents ? 'lg:ml-0' : null,
                      ]
                    : ['sm:mx-auto', 'max-w-3xl', 'sm:rounded-md', 'mb-8'],
            )}
        >
            <Image
                alt="Page cover image"
                sources={{
                    light: resolved
                        ? {
                              src: resolved.href,
                              size: resolved.fileDimensions,
                          }
                        : {
                              src: defaultPageCover.src,
                              size: {
                                  width: defaultPageCover.width,
                                  height: defaultPageCover.height,
                              },
                          },
                }}
                resize={
                    // When using the default cover, we don't want to resize as it's a SVG
                    !!resolved
                }
                sizes={[
                    // Cover takes the full width on mobile/table
                    {
                        media: '(max-width: 768px)',
                        width: 768,
                    },
                    {
                        media: '(max-width: 1024px)',
                        width: 1024,
                    },
                    // Maximum size of the cover
                    { width: 1248 },
                ]}
                className={tcls(
                    'w-full',
                    'object-cover',
                    'object-center',
                    as === 'full'
                        ? ['[mask-image:linear-gradient(rgba(0,0,0,1),_rgba(0,0,0,0.5))]']
                        : null,
                )}
                inlineStyle={{ aspectRatio: `${PAGE_COVER_SIZE.width}/${PAGE_COVER_SIZE.height}` }}
            />
        </div>
    );
}
