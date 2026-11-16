import type { StaticImageData } from 'next/image';
import { assert } from 'ts-essentials';

import {
    CustomizationDefaultThemeMode,
    type RevisionPageDocument,
    type RevisionPageDocumentCover,
} from '@gitbook/api';

import { getCoverHeight } from './coverHeight';
import defaultPageCoverSVG from './default-page-cover.svg';
import { PageCoverImage } from './PageCoverImage';
import { getImageAttributes } from '@/components/utils';
import type { GitBookSiteContext } from '@/lib/context';
import { type ResolvedContentRef, resolveContentRef } from '@/lib/references';

const defaultPageCover = defaultPageCoverSVG as StaticImageData;

/**
 * Cover for the page.
 */
export async function PageCover(props: {
    as: 'hero' | 'full' | 'background';
    page: RevisionPageDocument;
    cover: RevisionPageDocumentCover;
    context: GitBookSiteContext;
}) {
    const { as, page, cover, context } = props;
    const height = getCoverHeight(cover);
    const mask = page.layout.coverMask === 'radial' ? 'radial' : 'none';

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
            <div
                data-gb-page-cover
                data-cover-text-color={cover.textColor}
                data-cover-text-color-dark={cover.textColorDark}
                data-cover-type={as}
                data-full={String(as === 'full')}
                className="page-cover"
            >
                <PageCoverImage
                    imgs={{
                        light,
                        dark,
                    }}
                    y={cover.yPos}
                    height={height}
                    mask={mask}
                    priorityTheme={
                        context.customization.themes.default === CustomizationDefaultThemeMode.Dark
                            ? 'dark'
                            : 'light'
                    }
                />
            </div>
        </>
    );
}
