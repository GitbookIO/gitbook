'use client';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useResizeObserver } from 'usehooks-ts';

interface ImageSize {
    width: number;
    height: number;
}

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

/**
 * Hook to calculate the object position Y percentage for a cover image
 * based on the y offset, image dimensions, and container dimensions.
 */
export function useCoverPosition(imgs: Images, y: number) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loadedDimensions, setLoadedDimensions] = useState<ImageSize | null>(null);
    const [isLoading, setIsLoading] = useState(!imgs.light.size && !imgs.dark?.size);

    const container = useResizeObserver({
        // @ts-expect-error wrong types
        ref: containerRef,
    });

    // Load original image dimensions if not provided in `imgs`
    useLayoutEffect(() => {
        // Check if we have dimensions from dark (if provided) or else the default light.
        const hasDimensions = imgs.dark?.size || imgs.light.size;

        if (hasDimensions) {
            return; // Already have dimensions
        }

        setIsLoading(true);

        // Load the original image (using src, not srcSet) to get true dimensions
        // Use dark image if available, otherwise fall back to light
        const imageToLoad = imgs.dark || imgs.light;
        const img = new Image();
        img.onload = () => {
            setLoadedDimensions({
                width: img.naturalWidth,
                height: img.naturalHeight,
            });
            setIsLoading(false);
        };
        img.onerror = () => {
            // If image fails to load, use a fallback
            setIsLoading(false);
        };
        img.src = imageToLoad.src;
    }, [imgs.light, imgs.dark]);

    // Use provided dimensions or fall back to loaded dimensions
    // Check dark first, then light, then loaded dimensions
    const imageDimensions = imgs.dark?.size ?? imgs.light.size ?? loadedDimensions;

    // Calculate ratio and dimensions similar to useCoverPosition hook
    const ratio =
        imageDimensions && container.height && container.width
            ? Math.max(
                  container.width / imageDimensions.width,
                  container.height / imageDimensions.height
              )
            : 1;
    const safeRatio = ratio || 1;

    const scaledHeight =
        imageDimensions && container.height ? imageDimensions.height * safeRatio : null;
    const maxOffset =
        scaledHeight && container.height
            ? Math.max(0, (scaledHeight - container.height) / 2 / safeRatio)
            : 0;

    // Parse the position between the allowed min/max
    const objectPositionY = useMemo(() => {
        if (!container.height || !imageDimensions) {
            return 50;
        }

        const scaled = imageDimensions.height * safeRatio;
        if (scaled <= container.height || maxOffset === 0) {
            return 50;
        }

        const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, y));
        const relative = (maxOffset - clampedOffset) / (2 * maxOffset);
        return relative * 100;
    }, [container.height, imageDimensions, maxOffset, safeRatio, y]);

    return {
        containerRef,
        objectPositionY,
        isLoading: !imageDimensions || isLoading,
    };
}
