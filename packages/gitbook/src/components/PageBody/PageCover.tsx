import type { GitBookSiteContext } from '@/lib/context';
import type { RevisionPageDocument, RevisionPageDocumentCover } from '@gitbook/api';
import type { StaticImageData } from 'next/image';

import { getImageAttributes } from '@/components/utils';
import { type ResolvedContentRef, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { assert } from 'ts-essentials';
import { CONTENT_STYLE } from '../layout';
import { PageCoverImage } from './PageCoverImage';
import { getCoverHeight } from './coverHeight';
import defaultPageCoverSVG from './default-page-cover.svg';

const defaultPageCover = defaultPageCoverSVG as StaticImageData;

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
    const height = getCoverHeight(cover);

    const [resolved, resolvedDark] = await Promise.all([
        cover.ref ? resolveContentRef(cover.ref, context) : null,
        cover.refDark ? resolveContentRef(cover.refDark, context) : null,
    ]);

    const sizes = [
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
    ];

    const getImage = async (resolved: ResolvedContentRef | null, returnNull = false) => {
        if (!resolved && returnNull) return;
        // If we don't have a size for the image, we want to calculate it so that we can use srcSet
        const size =
            resolved?.file?.dimensions ??
            (await context.imageResizer?.getImageSize(resolved?.href || defaultPageCover.src, {}));
        const attrs = await getImageAttributes({
            sizes,
            source: resolved
                ? {
                      src: resolved.href,
                      size: size ?? null,
                  }
                : {
                      src: defaultPageCover.src,
                      size: {
                          width: defaultPageCover.width,
                          height: defaultPageCover.height,
                      },
                  },
            quality: 100,
            resize: context.imageResizer ?? false,
        });
        return {
            ...attrs,
            size: size ?? undefined,
        };
    };

    const images = await Promise.all([getImage(resolved), getImage(resolvedDark, true)]);
    const [light, dark] = images;
    assert(light, 'Light image should be defined');

    return (
        <div
            id="page-cover"
            data-full={String(as === 'full')}
            className={tcls(
                'overflow-hidden',
                // Negative margin to balance the container padding
                '-mx-4',

                // Full-width cover: extend to edges, disregard TOC where possible
                as === 'full'
                    ? [
                          'sm:-mx-6',
                          'md:-mx-8',
                          !page.layout.tableOfContents &&
                          context.customization.header.preset !== 'none'
                              ? [
                                    'xl:-ml-76', // Account for TOC width
                                    'xl:layout-full:-mx-8', // In layout-full (no TOC), extend to screen edges
                                    'xl:layout-full:w-screen',
                                    // Round the bottom corners once the page is wider than the image
                                    '2xl:not-layout-full:circular-corners:rounded-b-3xl',
                                    '2xl:not-layout-full:rounded-corners:rounded-b-xl',
                                ]
                              : [
                                    // Round the bottom left corner once the sidebar is shown next to it
                                    'lg:rounded-corners:rounded-bl-xl',
                                    'lg:circular-corners:rounded-bl-3xl',
                                    // Round the bottom right corner once the page is wider than the image
                                    '2xl:rounded-corners:rounded-br-xl',
                                    '2xl:circular-corners:rounded-br-3xl',
                                ],
                      ]
                    : [
                          // Regular cover: size regularly along with other content
                          CONTENT_STYLE,
                          'max-sm:-mx-4',
                          'sm:rounded-corners:rounded-xl',
                          'sm:circular-corners:rounded-3xl',
                          'mb-8',
                          'max-sm:w-screen',
                          'max-sm:-mt-8',
                      ]
            )}
        >
            <PageCoverImage
                imgs={{
                    light,
                    dark,
                }}
                y={cover.yPos}
                height={height}
            />
        </div>
    );
}
