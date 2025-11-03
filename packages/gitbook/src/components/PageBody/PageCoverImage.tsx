'use client';
import { tcls } from '@/lib/tailwind';
import type { ImageSize } from '../utils';
import { useCoverPosition } from './useCoverPosition';

interface ImageAttributes {
    src: string;
    srcSet?: string;
    sizes?: string;
    width?: number;
    height?: number;
    size?: ImageSize;
}

interface Images {
    light: ImageAttributes;
    dark?: ImageAttributes;
}

const PAGE_COVER_SIZE: ImageSize = { width: 1990, height: 480 };

interface PageCoverImageProps {
    imgs: Images;
    y: number;
    // Only if the `height` was customized by the user (and thus defined), we use it to set the cover's height and skip the default behaviour of fixed aspect-ratio.
    height: number | undefined;
}

export function PageCoverImage(props: PageCoverImageProps) {
    const { imgs, y, height } = props;
    const { containerRef, objectPositionY, isLoading } = useCoverPosition(imgs, y);

    if (isLoading) {
        return (
            <div className="h-full w-full overflow-hidden" ref={containerRef}>
                <div className="h-full w-full animate-pulse bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" />
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-hidden" ref={containerRef} style={{ height }}>
            <img
                src={imgs.light.src}
                srcSet={imgs.light.srcSet}
                sizes={imgs.light.sizes}
                fetchPriority="high"
                alt="Page cover"
                className={tcls('w-full', 'object-cover', imgs.dark ? 'dark:hidden' : '')}
                style={{
                    aspectRatio: height
                        ? undefined
                        : `${PAGE_COVER_SIZE.width}/${PAGE_COVER_SIZE.height}`,
                    objectPosition: `50% ${objectPositionY}%`,
                    height, // if no height is passed, no height will be set.
                }}
            />
            {imgs.dark && (
                <img
                    src={imgs.dark.src}
                    srcSet={imgs.dark.srcSet}
                    sizes={imgs.dark.sizes}
                    fetchPriority="low"
                    alt="Page cover"
                    className={tcls('w-full', 'object-cover', 'dark:inline', 'hidden')}
                    style={{
                        aspectRatio: height
                            ? undefined
                            : `${PAGE_COVER_SIZE.width}/${PAGE_COVER_SIZE.height}`,
                        objectPosition: `50% ${objectPositionY}%`,
                        height, // if no height is passed, no height will be set.
                    }}
                />
            )}
        </div>
    );
}
