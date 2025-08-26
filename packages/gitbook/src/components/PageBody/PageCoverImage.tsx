'use client';
import { tcls } from '@/lib/tailwind';
import { useRef } from 'react';
import { useResizeObserver } from 'usehooks-ts';
import type { ImageSize } from '../utils';

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

function getTop(container: { height?: number; width?: number }, y: number, img: ImageAttributes) {
    // When the size of the image hasn't been determined, we fallback to the center position
    if (!img.size || y === 0) return '50%';
    const ratio =
        container.height && container.width
            ? Math.max(container.width / img.size.width, container.height / img.size.height)
            : 1;
    const scaledHeight = img.size ? img.size.height * ratio : PAGE_COVER_SIZE.height;
    const top =
        container.height && img.size ? (container.height - scaledHeight) / 2 + y * ratio : y;
    return `${top}px`;
}

export function PageCoverImage({ imgs, y }: { imgs: Images; y: number }) {
    const containerRef = useRef<HTMLDivElement>(null);

    const container = useResizeObserver({
        ref: containerRef,
    });

    return (
        <div className="h-full w-full overflow-hidden" ref={containerRef}>
            <img
                src={imgs.light.src}
                srcSet={imgs.light.srcSet}
                sizes={imgs.light.sizes}
                fetchPriority="high"
                alt="Page cover"
                className={tcls('w-full', 'object-cover', imgs.dark ? 'dark:hidden' : '')}
                style={{
                    aspectRatio: `${PAGE_COVER_SIZE.width}/${PAGE_COVER_SIZE.height}`,
                    objectPosition: `50% ${getTop(container, y, imgs.light)}`,
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
                        aspectRatio: `${PAGE_COVER_SIZE.width}/${PAGE_COVER_SIZE.height}`,
                        objectPosition: `50% ${getTop(container, y, imgs.dark)}`,
                    }}
                />
            )}
        </div>
    );
}
