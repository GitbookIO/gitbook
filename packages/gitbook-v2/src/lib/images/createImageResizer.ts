import 'server-only';
import { GITBOOK_IMAGE_RESIZE_SIGNING_KEY, GITBOOK_IMAGE_RESIZE_URL } from '../env';
import type { GitBookLinker } from '../links';
import { SizableImageAction, checkIsSizableImageURL } from './checkIsSizableImageURL';
import { getImageSize } from './resizer';
import { type SignatureVersion, generateImageSignature } from './signatures';
import type { ImageResizer } from './types';

/**
 * Create an image resizer for a rendering context.
 */
export function createImageResizer({
    imagesContextId,
    linker,
}: {
    /** The linker to use to create URLs. */
    linker: GitBookLinker;
    /** The site identifier to use for verifying the image signature. */
    imagesContextId: string;
}): ImageResizer {
    if (!GITBOOK_IMAGE_RESIZE_URL || !GITBOOK_IMAGE_RESIZE_SIGNING_KEY) {
        return createNoopImageResizer();
    }

    return {
        getResizedImageURL: (urlInput) => {
            if (checkIsSizableImageURL(urlInput) === SizableImageAction.Skip) {
                return null;
            }

            let cachedSignature: {
                signature: string;
                version: SignatureVersion;
            } | null = null;

            return async (options) => {
                cachedSignature ??= await generateImageSignature({
                    imagesContextId,
                    url: urlInput,
                });

                const url = linker.toAbsoluteURL(linker.toPathInSite('/~gitbook/image'));
                const searchParams = new URLSearchParams();
                searchParams.set('url', getImageAPIUrl(urlInput));

                if (options.width) {
                    searchParams.set('width', options.width.toString());
                }
                if (options.height) {
                    searchParams.set('height', options.height.toString());
                }
                if (options.dpr) {
                    searchParams.set('dpr', options.dpr.toString());
                }
                if (options.quality) {
                    searchParams.set('quality', options.quality.toString());
                }

                searchParams.set('sign', cachedSignature.signature);
                searchParams.set('sv', cachedSignature.version);

                return `${url}?${searchParams.toString()}`;
            };
        },

        getImageSize: async (input, options) => {
            if (checkIsSizableImageURL(input) !== SizableImageAction.Resize) {
                return null;
            }

            return getImageSize(input, options);
        },
    };
}

/**
 * Create an image resizer that doesn't do any resizing.
 */
export function createNoopImageResizer(): ImageResizer {
    return {
        getResizedImageURL: () => null,
        getImageSize: async (_input) => null,
    };
}

/**
 * Because of a bug in Cloudflare, 127.0.0.1 is replaced by localhost.
 * We protect against it by converting to a special token, and then parsing
 * the token in the image API.
 */
const GITBOOK_LOCALHOST_TOKEN = '$GITBOOK_LOCALHOST$';

/**
 * Prepare a URL for the GitBook Open Image API.
 */
export function getImageAPIUrl(url: string): string {
    return url.replaceAll('127.0.0.1', GITBOOK_LOCALHOST_TOKEN);
}

export function parseImageAPIURL(url: string): string {
    return url.replaceAll(GITBOOK_LOCALHOST_TOKEN, '127.0.0.1');
}
