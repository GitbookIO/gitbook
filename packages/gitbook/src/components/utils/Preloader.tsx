'use client';

import { useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * Preloads an image, but only when this component is mounted. It saves bandwidth by not preloading images for route that are not loaded
 * @param props Image props for preloading.
 */
export function Preloader(props: {
    src: string;
    srcSet?: string;
    sizes?: string;
    fetchPriority?: 'high' | 'low' | 'auto';
}) {
    const { src, srcSet, sizes, fetchPriority } = props;
    useEffect(() => {
        console.log('Preloading image:', src);
        ReactDOM.preload(src, {
            as: 'image',
            imageSrcSet: srcSet,
            imageSizes: sizes,
            fetchPriority,
        });
    }, [src, srcSet, sizes, fetchPriority]);
    return null;
}
