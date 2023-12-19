import React from 'react';
import { notFound } from 'next/navigation';
import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import { SpaceParams } from '../../fetch';
import { getSpace, getSpaceCustomization } from '@/lib/api';
import { tcls } from '@/lib/tailwind';
import { getEmojiForCode } from '@/lib/emojis';

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
export async function GET(req: NextRequest, { params }: { params: SpaceParams }) {
    const { spaceId } = params;

    const options = getOptions(req.url);
    const size = SIZES[options.size];

    const [space, customization] = await Promise.all([
        getSpace(spaceId),
        getSpaceCustomization(spaceId),
    ]);

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
                        : space.title.slice(0, 1).toUpperCase()}
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
