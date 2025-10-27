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

export function PageCoverImage({ imgs, y }: { imgs: Images; y: number }) {
    const { containerRef, objectPositionY, isLoading } = useCoverPosition(imgs, y);

    if (isLoading) {
        return (
            <div className="h-full w-full overflow-hidden" ref={containerRef}>
                <div className="h-full w-full animate-pulse bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" />
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-hidden" ref={containerRef}>
            <img
                src={imgs.light.src}
                srcSet={imgs.light.srcSet}
                sizes={imgs.light.sizes}
                fetchPriority="high"
                alt="Page cover"
                className={tcls('h-full', 'w-full', 'object-cover', imgs.dark ? 'dark:hidden' : '')}
                style={{
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
                    className={tcls('h-full', 'w-full', 'object-cover', 'dark:inline', 'hidden')}
                    style={{
                        objectPosition: `50% ${objectPositionY}%`,
                    }}
                />
            )}
        </div>
    );
}
