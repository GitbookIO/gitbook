import type { RevisionPageDocument, RevisionPageDocumentCover } from '@gitbook/api';
import type { GitBookSiteContext } from '@v2/lib/context';
import type { StaticImageData } from 'next/image';

import { Image, type ImageSize } from '@/components/utils';
import { resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import defaultPageCoverSVG from './default-page-cover.svg';

const defaultPageCover = defaultPageCoverSVG as StaticImageData;
const PAGE_COVER_SIZE: ImageSize = { width: 1990, height: 480 };

/**
 * Cover for the page.
 */
export async function PageCover(props: {
    as: 'hero' | 'full';
    page: RevisionPageDocument;
    cover: RevisionPageDocumentCover;
    context: GitBookSiteContext;
}) {
    const { as, page, cover, context } = props;
    const resolved = cover.ref ? await resolveContentRef(cover.ref, context) : null;
    const resolvedDark = cover.refDark ? await resolveContentRef(cover.refDark, context) : null;

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
                          'lg:-mr-8',
                          'lg:-ml-12',
                          !page.layout.tableOfContents &&
                          context.customization.header.preset !== 'none'
                              ? 'xl:-ml-64'
                              : null,
                      ]
                    : [
                          'sm:mx-auto',
                          'max-w-3xl ',
                          'page-full-width:max-w-screen-2xl',
                          'sm:rounded-md',
                          'mb-8',
                      ]
            )}
        >
            <Image
                alt="Page cover image"
                sources={{
                    light: resolved
                        ? {
                              src: resolved.href,
                              size: resolved.file?.dimensions,
                          }
                        : {
                              src: defaultPageCover.src,
                              size: {
                                  width: defaultPageCover.width,
                                  height: defaultPageCover.height,
                              },
                          },
                    dark: resolvedDark
                        ? {
                              src: resolvedDark.href,
                              size: resolvedDark.file?.dimensions,
                          }
                        : null,
                }}
                resize={
                    // When using the default cover, we don't want to resize as it's a SVG
                    resolved ? context.imageResizer : false
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
                className={tcls('w-full', 'object-cover', 'object-center')}
                inlineStyle={{ aspectRatio: `${PAGE_COVER_SIZE.width}/${PAGE_COVER_SIZE.height}` }}
            />
        </div>
    );
}
