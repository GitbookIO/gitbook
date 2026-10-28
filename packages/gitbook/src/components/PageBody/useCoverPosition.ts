'use client';
import { useLayoutEffect, useState } from 'react';

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
 * Hook to compute the CSS object position Y for a cover image, from the y offset and the image
 * dimensions. The container must set `container-type: inline-size` and be as wide as the image,
 * since the position is computed against its width.
 */
export function useCoverPosition(
    imgs: Images,
    y: number,
    container: { height: number | undefined; aspectRatio: ImageSize }
) {
    const [loadedDimensions, setLoadedDimensions] = useState<ImageSize | null>(null);
    const [isLoading, setIsLoading] = useState(!imgs.light.size && !imgs.dark?.size);

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

    return {
        objectPositionY: imageDimensions
            ? getCoverObjectPositionY(imageDimensions, y, container)
            : '50%',
        isLoading: !imageDimensions || isLoading,
    };
}

/**
 * Offset the image `y` natural pixels from centered, clamped so it keeps covering the container.
 * Expressed in CSS against the container width (`cqw`), so it renders the same on the server as
 * after hydration, without measuring the container.
 */
function getCoverObjectPositionY(
    image: ImageSize,
    y: number,
    container: { height: number | undefined; aspectRatio: ImageSize }
): string {
    const containerHeight = container.height
        ? `${container.height}px`
        : `${(100 * container.aspectRatio.height) / container.aspectRatio.width}cqw`;
    // Rendered height of the image under `object-fit: cover`.
    const scaledHeight = `max(${(100 * image.height) / image.width}cqw, ${containerHeight})`;
    const maxOffset = `(${scaledHeight} - ${containerHeight}) / 2`;
    const offset = `${scaledHeight} * ${y / image.height}`;

    return `calc(50% + clamp(-1 * ${maxOffset}, ${offset}, ${maxOffset}))`;
}
