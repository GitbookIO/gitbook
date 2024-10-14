import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import React from 'react';

import { getCurrentSiteCustomization, getSite, getSpace } from '@/lib/api';
import { getEmojiForCode } from '@/lib/emojis';
import { getSiteContentPointer } from '@/lib/pointer';
import { tcls } from '@/lib/tailwind';
import { getContentTitle } from '@/lib/utils';

export const runtime = 'edge';

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
 * Render an icon for the space.
 */
export async function GET(req: NextRequest) {
    const options = getOptions(req.url);
    const size = SIZES[options.size];

    const pointer = getSiteContentPointer();
    const spaceId = pointer.spaceId;

    const [space, customization] = await Promise.all([
        getSpace(spaceId, pointer.siteShareKey),
        getCurrentSiteCustomization(pointer),
    ]);
    const site = await getSite(pointer.organizationId, pointer.siteId);
    const contentTitle = getContentTitle(space, customization, site);

    return new ImageResponse(
        (
            <div
                tw={tcls(options.theme === 'light' ? 'bg-white' : 'bg-gray-900', size.boxStyle)}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <h2
                    tw={tcls(
                        size.textSize,
                        'font-bold',
                        'tracking-tight',
                        options.theme === 'light' ? 'text-gray-900' : 'text-white',
                    )}
                >
                    {'emoji' in customization.favicon
                        ? getEmojiForCode(customization.favicon.emoji)
                        : contentTitle.slice(0, 1).toUpperCase()}
                </h2>
            </div>
        ),
        {
            width: size.width,
            height: size.height,
        },
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
