import type { ImageResizer, ResizeImageOptions } from './types';

/**
 * Quick utility to get a resized image URL.
 */
export async function getResizedImageURL(
    resizer: ImageResizer,
    url: string,
    options: ResizeImageOptions
) {
    const getURL = resizer.resize(url);
    if (!getURL) {
        return url;
    }

    return await getURL(options);
}
