import { CustomizationHeaderPreset } from '@gitbook/api';
import { colorContrast } from '@gitbook/colors';
import { direction } from 'direction';
import { imageSize } from 'image-size';
import { redirect } from 'next/navigation';
import { ImageResponse } from 'next/og';

import { type PageParams, fetchPageData } from '@/components/SitePage';
import { getAssetURL } from '@/lib/assets';
import type { GitBookSiteContext } from '@/lib/context';
import { computeImageFonts } from '@/lib/imageFonts';
import {
    type ResizeImageOptions,
    SizableImageAction,
    checkIsSizableImageURL,
    getResizedImageURL,
    resizeImage,
} from '@/lib/images';
import { getExtension } from '@/lib/paths';
import { getCacheTag } from '@gitbook/cache-tags';
import { SiteDefaultIcon } from './icon';

/**
 * Render the OpenGraph image for a site content.
 */
export async function serveOGImage(baseContext: GitBookSiteContext, params: PageParams) {
    const { context, pageTarget } = await fetchPageData(baseContext, params);
    const { customization, site, imageResizer } = context;
    const page = pageTarget?.page;

    // If user configured a custom social preview, we redirect to it.
    if (customization.socialPreview.url) {
        redirect(
            await getResizedImageURL(imageResizer, customization.socialPreview.url, {
                width: 1200,
                height: 630,
            })
        );
    }

    // Compute all text to load only the necessary fonts
    const pageTitle = page
        ? page.title.length > 64
            ? `${page.title.slice(0, 64)}...`
            : page.title
        : 'Not found';
    const pageDescription =
        page?.description && page?.title.length <= 64
            ? page.description.length > 164
                ? `${page.description.slice(0, 164)}...`
                : page.description
            : '';

    // Load the fonts
    const fontLoader = async () =>
        computeImageFonts(customization, {
            regularText: pageDescription,
            boldText: `${site.title} ${pageTitle}`,
        });

    const theme = customization.themes.default;
    const useLightTheme = theme === 'light';

    // We have no access to CSS variables, so we'll have to hardcode some values
    const baseColors = { light: '#ffffff', dark: '#111827' };

    let colors = {
        background: baseColors[theme],
        gradient: customization.styling.primaryColor[theme],
        title: customization.styling.primaryColor[theme],
        body: baseColors[useLightTheme ? 'dark' : 'light'], // Invert text on background
    };

    const gridWhite = getAssetURL('images/ogimage-grid-white.png');
    const gridBlack = getAssetURL('images/ogimage-grid-black.png');

    let gridAsset = useLightTheme ? gridBlack : gridWhite;

    switch (customization.header.preset) {
        case CustomizationHeaderPreset.Custom:
            colors = {
                background: customization.header.backgroundColor?.[theme] || colors.background,
                gradient: customization.header.linkColor?.[theme] || colors.gradient,
                title: customization.header.linkColor?.[theme] || colors.title,
                body: colorContrast(
                    customization.header.backgroundColor?.[theme] || colors.background,
                    [baseColors.light, baseColors.dark]
                )!,
            };
            gridAsset = colors.body === baseColors.light ? gridWhite : gridBlack;
            break;

        case CustomizationHeaderPreset.Bold:
            colors = {
                background: customization.styling.primaryColor[theme],
                gradient: colorContrast(customization.styling.primaryColor[theme], [
                    baseColors.light,
                    baseColors.dark,
                ])!,
                title: colorContrast(customization.styling.primaryColor[theme], [
                    baseColors.light,
                    baseColors.dark,
                ])!,
                body: colorContrast(customization.styling.primaryColor[theme], [
                    baseColors.light,
                    baseColors.dark,
                ])!,
            };
            gridAsset = colors.body === baseColors.light ? gridWhite : gridBlack;
            break;
    }

    const faviconLoader = async () => {
        if (customization.header.logo) {
            // Don't load the favicon if we have a logo
            // as it'll not be used.
            return null;
        }

        const faviconSize = {
            width: 48,
            height: 48,
        };

        if ('icon' in customization.favicon) {
            const faviconImage = await fetchImage(customization.favicon.icon[theme], faviconSize);
            if (faviconImage) {
                return <img {...faviconImage} {...faviconSize} alt="Icon" />;
            }
        }

        return (
            <SiteDefaultIcon
                context={context}
                options={{
                    size: 'small',
                    theme,
                    border: true,
                }}
                style={faviconSize}
            />
        );
    };

    const logoLoader = async () => {
        if (!customization.header.logo) {
            return null;
        }

        return await fetchImage(
            useLightTheme ? customization.header.logo.light : customization.header.logo.dark,
            {
                height: 60,
            }
        );
    };

    const [favicon, logo, { fontFamily, fonts }] = await Promise.all([
        faviconLoader(),
        logoLoader(),
        fontLoader(),
    ]);

    return new ImageResponse(
        <div
            tw={`justify-between p-20 relative w-full h-full flex flex-col bg-[${colors.background}] text-[${colors.body}]`}
            style={{
                fontFamily,
            }}
        >
            {/* Gradient */}
            <div
                tw="absolute inset-0"
                style={{
                    backgroundImage: `radial-gradient(ellipse 100% 100% at top right , ${colors.gradient},${colors.gradient}00)`,
                    opacity: 0.5,
                }}
            />

            {/* Grid */}
            <img
                tw="absolute inset-0 w-[100vw] h-[100vh]"
                src={(await fetchStaticImage(gridAsset)).src}
                alt="Grid"
            />

            {/* Logo */}
            {logo ? (
                <div tw="flex flex-row">
                    <img {...logo} alt="Logo" tw="h-[60px]" />
                </div>
            ) : (
                <div tw="flex flex-row items-center">
                    {favicon}
                    <h3 tw="text-4xl ml-4 my-0 font-bold">{transformText(site.title)}</h3>
                </div>
            )}

            {/* Title and description */}
            <div tw="flex flex-col">
                <h1
                    tw={`text-8xl my-0 tracking-tight leading-none text-left text-[${colors.title}] font-bold`}
                >
                    {transformText(pageTitle)}
                </h1>
                {pageDescription ? (
                    <h2 tw="text-4xl mb-0 mt-8 w-[75%] font-normal">
                        {transformText(pageDescription)}
                    </h2>
                ) : null}
            </div>
        </div>,
        {
            width: 1200,
            height: 630,
            fonts: fonts.length ? fonts : undefined,
            headers: {
                // We don't want to cache the image for too long in the browser
                'cache-control': 'public, max-age=300, s-maxage=31536000',
                'cache-tag': [
                    getCacheTag({
                        tag: 'site',
                        site: baseContext.site.id,
                    }),
                    getCacheTag({
                        tag: 'space',
                        space: baseContext.space.id,
                    }),
                ].join(','),
            },
        }
    );
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const staticCache = new Map<string, any>();

/**
 * Get or initialize a value in the static cache.
 */
async function getWithCache<T>(key: string, fn: () => Promise<T>) {
    const cached = staticCache.get(key) as T;
    if (cached) {
        return Promise.resolve(cached);
    }

    const result = await fn();
    staticCache.set(key, result);
    return result;
}

/**
 * Read a static image and cache it in memory.
 */
async function fetchStaticImage(url: string) {
    return getWithCache(`static-image:${url}`, async () => {
        const image = await fetchImage(url);
        if (!image) {
            throw new Error('Failed to fetch static image');
        }

        return image;
    });
}

/**
 * @vercel/og supports the following image formats:
 * Extracted from https://github.com/vercel/next.js/blob/canary/packages/next/src/compiled/%40vercel/og/index.node.js
 */
const UNSUPPORTED_IMAGE_EXTENSIONS = ['.avif', '.webp'];
const SUPPORTED_IMAGE_TYPES = [
    'image/png',
    'image/apng',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
];

/**
 * Fetch an image from a URL and return a base64 encoded string.
 * We do this as @vercel/og is otherwise failing on SVG images referenced by a URL.
 */
async function fetchImage(url: string, options?: ResizeImageOptions) {
    // Skip early some images to avoid fetching them
    const parsedURL = new URL(url);

    let response: Response;
    if (
        UNSUPPORTED_IMAGE_EXTENSIONS.includes(getExtension(parsedURL.pathname).toLowerCase()) ||
        checkIsSizableImageURL(url) === SizableImageAction.Resize
    ) {
        // We use the image resizer to normalize the image format to PNG.
        // as @vercel/og can sometimes fail on some JPEG images, and will fail on avif and webp images.
        response = await resizeImage(url, {
            ...options,
            format: 'png',
            bypassSkipCheck: true, // Bypass the check to see if the image can be resized
        });
    } else {
        response = await fetch(url);
    }

    // Filter out unsupported image types
    const contentType = response.headers.get('content-type');
    if (!contentType || !SUPPORTED_IMAGE_TYPES.some((type) => contentType.includes(type))) {
        return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const src = `data:${contentType};base64,${base64}`;

    try {
        const { width, height } = imageSize(buffer);
        // If we provide a width and height in the options, we always want to use them
        // The resize in cloudflare can fail and will fallback to the original size, which could stretch the image
        // If the image is smaller than the requested size, it will also return the original image
        if (
            (options?.width && options.width !== width) ||
            (options?.height && options.height !== height)
        ) {
            return {
                src,
                width: options.width,
                height: options.height,
            };
        }
        return { src, width: width, height: height };
    } catch {
        return null;
    }
}

/**
 * @vercel/og doesn't support RTL text, so we need to transform with a HACK for now.
 * We can remove it once support has been added.
 * https://github.com/vercel/satori/issues/74
 */
function transformText(text: string) {
    const dir = direction(text);
    if (dir !== 'rtl') {
        return text;
    }

    return '';
}
