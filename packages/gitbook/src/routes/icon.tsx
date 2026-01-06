import { notFound, redirect } from 'next/navigation';
import { ImageResponse } from 'next/og';

import type { GitBookSiteContext } from '@/lib/context';
import { getEmojiForCode } from '@/lib/emojis';
import { computeImageFonts } from '@/lib/imageFonts';
import { getResizedImageURL } from '@/lib/images';
import { tcls } from '@/lib/tailwind';
import { getCacheTag } from '@gitbook/cache-tags';
import { colorScale } from '@gitbook/colors';

const SIZES = {
    /** Size for a favicon */
    small: {
        width: 48,
        height: 48,
        textSize: 'text-[32px]',
        boxStyle: 8,
        borderWidth: 1,
    },
    /** Size for display as iOS app icon */
    medium: {
        width: 180,
        height: 180,
        textSize: 'text-[115px]',
        boxStyle: 22.5,
        borderWidth: 3,
    },
    /** Size for display in the site header */
    large: {
        width: 256,
        height: 256,
        textSize: 'text-[164px]',
        boxStyle: 32,
        borderWidth: 4,
    },
    /** Size for display as Android app icon */
    xlarge: {
        width: 512,
        height: 512,
        textSize: 'text-[328px]',
        boxStyle: 64,
        borderWidth: 8,
    },
};

type RenderIconOptions = {
    size: keyof typeof SIZES;
    theme: 'light' | 'dark';
    border: boolean;
};

/**
 * Generate an icon for a site content.
 */
export async function serveIcon(context: GitBookSiteContext, req: Request) {
    const options = getOptions(req.url);
    const size = SIZES[options.size];

    const { customization } = context;
    const customIcon = 'icon' in customization.favicon ? customization.favicon.icon : null;

    // If the site has a custom icon, redirect to it
    if (customIcon) {
        const iconUrl = options.theme === 'light' ? customIcon.light : customIcon.dark;
        redirect(
            await getResizedImageURL(context.imageResizer, iconUrl, {
                width: size.width,
                height: size.height,
            })
        );
    }

    // Compute font loading based on site title or emoji
    const regularText = '';
    const boldText =
        'emoji' in customization.favicon ? '' : context.site.title.slice(0, 1).toUpperCase();
    const { fontFamily, fonts } = await computeImageFonts(customization, {
        regularText,
        boldText,
    });

    return new ImageResponse(
        <div style={{ fontFamily, width: '100%', height: '100%', display: 'flex' }}>
            <SiteDefaultIcon context={context} options={options} />
        </div>,
        {
            width: size.width,
            height: size.height,
            fonts: fonts.length ? fonts : undefined,
            headers: {
                'cache-tag': [
                    getCacheTag({
                        tag: 'site',
                        site: context.site.id,
                    }),
                ].join(','),
            },
        }
    );
}

/**
 * Render the icon as a React node.
 */
export function SiteDefaultIcon(props: {
    context: GitBookSiteContext;
    options: RenderIconOptions;
    style?: React.CSSProperties;
    tw?: string;
}) {
    const { context, options, style, tw } = props;
    const size = SIZES[options.size];

    const { site, customization } = context;
    const contentTitle = site.title;

    const primaryScale = colorScale(customization.styling.primaryColor[options.theme], {
        darkMode: options.theme === 'dark',
    });

    console.log('options', options);

    return (
        <div
            tw={tcls(tw)}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: options.border ? size.borderWidth : 0,
                borderColor: primaryScale[7],
                borderRadius: options.border
                    ? customization.styling.corners === 'rounded'
                        ? `${size.boxStyle}px`
                        : customization.styling.corners === 'circular'
                          ? '50%'
                          : '0px'
                    : 0,
                background: `linear-gradient(to bottom, ${primaryScale[options.theme === 'light' ? 2 : 6]} 0%, ${primaryScale[4]} 100%)`,
                ...style,
            }}
        >
            <h2
                tw={tcls(size.textSize, 'font-bold', 'tracking-tight')}
                style={{
                    color: primaryScale[10],
                    textShadow: `0 .05em .1em ${primaryScale[7]}`,
                }}
            >
                {'emoji' in customization.favicon
                    ? getEmojiForCode(customization.favicon.emoji)
                    : contentTitle.slice(0, 1).toUpperCase()}
            </h2>
        </div>
    );
}

function getOptions(inputUrl: string): {
    size: keyof typeof SIZES;
    theme: 'light' | 'dark';
    border: boolean;
} {
    const url = new URL(inputUrl);
    const sizeParam = (url.searchParams.get('size') ?? 'small') as keyof typeof SIZES;
    const themeParam = url.searchParams.get('theme') ?? 'light';
    const borderParam = url.searchParams.get('border') !== 'false';

    if (!SIZES[sizeParam] || !['light', 'dark'].includes(themeParam)) {
        notFound();
    }

    return {
        // @ts-ignore
        size: sizeParam,
        // @ts-ignore
        theme: themeParam,
        // @ts-ignore
        border: borderParam,
    };
}
