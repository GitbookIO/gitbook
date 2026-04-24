import type { GitBookSiteContext } from '@/lib/context';
import {
    CustomizationHeaderPreset,
    type RevisionPageDocument,
    type RevisionPageDocumentCover,
} from '@gitbook/api';
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
const DEFAULT_RESPONSIVE_COVER_CUTOFF = '56.25%';

/**
 * Cover for the page.
 */
export async function PageCover(props: {
    as: 'hero' | 'full' | 'background';
    page: RevisionPageDocument;
    cover: RevisionPageDocumentCover;
    context: GitBookSiteContext;
}) {
    let { as, cover, context } = props;
    const height = getCoverHeight(cover);

    const initialCoverCutoff = () => {
        if (!height) {
            return DEFAULT_RESPONSIVE_COVER_CUTOFF;
        }

        let total = height;
        if (context.customization.announcement?.enabled) {
            total += 68;
        }
        if (context.customization.header.preset !== CustomizationHeaderPreset.None) {
            total += 64;
        }
        if (context.visibleSections && context.visibleSections.list.length > 1) {
            total += 45;
        }
        return `${total}px`;
    };

    as = 'background';

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
        <>
            <style>{`:root { --cover-height: ${initialCoverCutoff()}; }`}</style>
            <div
                data-gb-page-cover
                // data-cover-text-color={white or black} TODO: Retrieve from API for light & dark mode
                data-cover-type={as}
                data-full={String(as === 'full')}
                className={tcls(
                    'overflow-hidden',
                    // Negative margin to balance the container padding
                    '-mx-4',

                    // Full-width cover: extend to edges, disregard TOC where possible
                    as === 'full' || as === 'background'
                        ? [
                              'sm:-mx-6',
                              'md:-mx-8',
                              'lg:-ml-12',

                              // Extend the full-width cover
                              'layout-default:page-no-toc:lg:-ml-92', // Extend into the left sidebar if there's no TOC...
                              'layout-wide:2xl:-mr-[clamp(2rem,calc((100vw-90rem)/2+2rem),18rem)]', // ...and to the right if there's no outline.
                              'layout-wide:page-no-toc:2xl:-mx-[max(calc((100vw-90rem)/2+2rem),2rem)]', // Span full width if the page content is centered.
                              'layout-wide:has-sidebar:page-no-toc:lg:-ml-[max(calc((100vw-90rem)/2+23rem),23rem)]', // If there's still a sidebar, we have to factor it in too.

                              // Corner rounding: we round once the page is wide enough to have space around the cover.
                              'layout-default:2xl:rounded-corners:rounded-b-xl',
                              'layout-default:2xl:circular-corners:rounded-b-3xl',
                              'layout-wide:3xl:circular-corners:rounded-b-3xl',
                              'layout-wide:3xl:rounded-corners:rounded-b-xl',
                              // Round the bottom left corner once the sidebar is shown next to it
                              'has-sidebar:lg:rounded-corners:rounded-bl-xl',
                              'has-sidebar:lg:circular-corners:rounded-bl-3xl',
                          ]
                        : null,

                    as === 'hero'
                        ? [
                              // Regular cover: size regularly along with other content
                              CONTENT_STYLE,
                              'max-sm:-mx-4',
                              'sm:rounded-corners:rounded-xl',
                              'sm:circular-corners:rounded-3xl',
                              'mb-8',
                              'max-sm:w-screen',
                              'max-sm:-mt-8',
                          ]
                        : null,

                    as === 'background'
                        ? [
                              '-z-1 absolute inset-x-0 contrast-more:opacity-5 *:contrast-more:blur-md',
                          ]
                        : null
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
        </>
    );
}
