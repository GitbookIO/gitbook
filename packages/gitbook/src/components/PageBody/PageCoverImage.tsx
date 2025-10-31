'use client';
import { tcls } from '@/lib/tailwind';
import type { ImageSize } from '../utils';
import { getRecommendedCoverDimensions } from './coverDimensions';
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

export function PageCoverImage({ imgs, y, height }: { imgs: Images; y: number; height: number }) {
    const { containerRef, objectPositionY, isLoading } = useCoverPosition(imgs, y);

    // Calculate the recommended aspect ratio for this height
    // This maintains the 4:1 ratio, allowing images to scale proportionally
    // and adapt their height when container width doesn't match the ideal ratio
    const recommendedDimensions = getRecommendedCoverDimensions(height);
    const aspectRatio = recommendedDimensions.width / recommendedDimensions.height;

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
                    aspectRatio: `${aspectRatio}`,
                    objectPosition: `50% ${objectPositionY}%`,
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
                        aspectRatio: `${aspectRatio}`,
                        objectPosition: `50% ${objectPositionY}%`,
                    }}
                />
            )}
        </div>
    );
}
