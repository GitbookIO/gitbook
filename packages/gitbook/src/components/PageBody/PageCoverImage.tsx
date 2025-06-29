'use client';
import { tcls } from '@/lib/tailwind';
import { useMemo, useRef } from 'react';
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

function useGetTop(
    container: { height?: number; width?: number },
    y: number,
    img?: ImageAttributes
) {
    const top = useMemo(() => {
        if (!img) return 0;
        const ratio =
            img?.size && container.height && container.width
                ? Math.max(container.width / img.size.width, container.height / img.size.height)
                : 1;
        if (!img) return 0;
        const scaledHeight = img.size ? img.size.height * ratio : PAGE_COVER_SIZE.height;
        return container.height && img.size ? (container.height - scaledHeight) / 2 + y * ratio : y;
    }, [container.width, container.height, img, y]);

    return top;
}

export function PageCoverImage({ imgs, y }: { imgs: Images; y: number }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const container = useResizeObserver({
        ref: containerRef,
    });

    const topLight = useGetTop(container, y, imgs.light);
    const topDark = useGetTop(container, y, imgs.dark);

    return (
        <div className="h-full w-full overflow-hidden" ref={containerRef}>
            <img
                ref={imageRef}
                src={imgs.light.src}
                fetchPriority="high"
                alt="Page cover"
                className={tcls('w-full', 'object-cover', imgs.dark ? 'dark:hidden' : '')}
                style={{
                    aspectRatio: `${PAGE_COVER_SIZE.width}/${PAGE_COVER_SIZE.height}`,
                    objectPosition: `50% ${topLight}px`,
                }}
            />
            {imgs.dark && (
                <img
                    ref={imageRef}
                    src={imgs.dark.src}
                    fetchPriority="low"
                    alt="Page cover"
                    className={tcls('w-full', 'object-cover', 'dark:inline', 'hidden')}
                    style={{
                        aspectRatio: `${PAGE_COVER_SIZE.width}/${PAGE_COVER_SIZE.height}`,
                        objectPosition: `50% ${topDark}px`,
                    }}
                />
            )}
        </div>
    );
}
