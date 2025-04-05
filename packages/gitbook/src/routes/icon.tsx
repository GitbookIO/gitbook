import { notFound, redirect } from 'next/navigation';
import { ImageResponse } from 'next/og';

import { getEmojiForCode } from '@/lib/emojis';
import { tcls } from '@/lib/tailwind';
import type { GitBookSiteContext } from '@v2/lib/context';
import { getResizedImageURL } from '@v2/lib/images';

const SIZES = {
    /** Size for a favicon */
    small: {
        width: 48,
        height: 48,
        textSize: 'text-[32px]',
        boxStyle: 'rounded-[8px]',
    },
    /** Size for display as an app icon or in the header */
    medium: {
        width: 256,
        height: 256,
        textSize: 'text-[164px]',
        boxStyle: 'rounded-[32px]',
    },
};

/**
 * Generate an icon for a site content.
 */
export async function serveIcon(context: GitBookSiteContext, req: Request) {
    const options = getOptions(req.url);
    const size = SIZES[options.size];

    const { site, customization } = context;
    const customIcon = 'icon' in customization.favicon ? customization.favicon.icon : null;

    console.log(
        'icon: serveIcon',
        req.url,
        customIcon ? 'custom' : 'emoji' in customization.favicon ? 'emoji' : 'fallback'
    );
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

    const contentTitle = site.title;

    // Load the font locally to prevent the shared instance used by ImageResponse.
    const font = await fetch(new URL('../fonts/Inter/Inter-Regular.ttf', import.meta.url)).then(
        (res) => res.arrayBuffer()
    );

    return new ImageResponse(
        <div
            tw={tcls(options.theme === 'light' ? 'bg-white' : 'bg-black', size.boxStyle)}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Inter',
            }}
        >
            <h2
                tw={tcls(
                    size.textSize,
                    'font-bold',
                    'tracking-tight',
                    options.theme === 'light' ? 'text-black' : 'text-white'
                )}
            >
                {'emoji' in customization.favicon
                    ? getEmojiForCode(customization.favicon.emoji)
                    : contentTitle.slice(0, 1).toUpperCase()}
            </h2>
        </div>,
        {
            width: size.width,
            height: size.height,
            fonts: [
                {
                    data: font,
                    name: 'Inter',
                    weight: 400,
                    style: 'normal',
                },
            ],
        }
    );
}

function getOptions(inputUrl: string): {
    size: keyof typeof SIZES;
    theme: 'light' | 'dark';
} {
    const url = new URL(inputUrl);
    const sizeParam = (url.searchParams.get('size') ?? 'small') as keyof typeof SIZES;
    const themeParam = url.searchParams.get('theme') ?? 'light';

    if (!SIZES[sizeParam] || !['light', 'dark'].includes(themeParam)) {
        notFound();
    }

    return {
        // @ts-ignore
        size: sizeParam,
        // @ts-ignore
        theme: themeParam,
    };
}
