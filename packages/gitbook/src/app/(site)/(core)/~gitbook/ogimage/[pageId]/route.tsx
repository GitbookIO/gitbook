import { CustomizationHeaderPreset } from '@gitbook/api';
import { redirect } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { ImageResponseOptions, NextRequest } from 'next/server';
import colorContrast from 'postcss-color-contrast/js';
import React from 'react';

import { absoluteHref } from '@/lib/links';
import { tcls } from '@/lib/tailwind';
import { getContentTitle } from '@/lib/utils';

import { PageIdParams, fetchPageData } from '../../../../fetch';

export const runtime = 'edge';

// TODO: Support all fonts available in GitBook
// Right now this is impossible since next/font/google does not expose the cached font file
// Another option would be to use the Satori prop `loadAdditionalAsset` [example](https://github.com/vercel/satori/blob/main/playground/pages/index.tsx),
// but this prop isn't (yet) exposed through `ImageResponse`.
const interRegular = await fetch(
    new URL('../../../../../../fonts/Inter/Inter-Regular.ttf', import.meta.url),
).then((res) => res.arrayBuffer());
const interBold = await fetch(
    new URL('../../../../../../fonts/Inter/Inter-Bold.ttf', import.meta.url),
).then((res) => res.arrayBuffer());

// By passing ImageResponse (Satori) a global object we make it cacheable.
// This also caches the font data, which should speed up rendering.
const imageOptions: ImageResponseOptions = {
    width: 1200,
    height: 630,
    fonts: [
        {
            name: 'Inter',
            data: interRegular,
            weight: 400,
            style: 'normal',
        },
        {
            name: 'Inter',
            data: interBold,
            weight: 700,
            style: 'normal',
        },
    ],
};

/**
 * Render the OpenGraph image for a space.
 */
export async function GET(req: NextRequest, { params }: { params: PageIdParams }) {
    const { space, page, customization, site } = await fetchPageData(params);

    if (customization.socialPreview.url) {
        // If user configured a custom social preview, we redirect to it.
        redirect(customization.socialPreview.url);
    }

    const theme = customization.themes.default;
    const useLightTheme = theme === 'light';

    // We have no access to CSS variables, so we'll have to hardcode some values
    const baseColors = {
        light: '#ffffff',
        dark: '#111827',
    };

    let colors = {
        background: baseColors[theme],
        gradient: customization.styling.primaryColor[theme],
        title: customization.styling.primaryColor[theme],
        body: baseColors[useLightTheme ? 'dark' : 'light'], // Invert text on background
    };

    const gridWhite = absoluteHref('~gitbook/static/images/ogimage-grid-white.png', true);
    const gridBlack = absoluteHref('~gitbook/static/images/ogimage-grid-black.png', true);

    let gridAsset = useLightTheme ? gridBlack : gridWhite;

    switch (customization.header.preset) {
        case CustomizationHeaderPreset.Custom:
            colors = {
                background: customization.header.backgroundColor?.[theme] || colors.background,
                gradient: customization.header.linkColor?.[theme] || colors.gradient,
                title: customization.header.linkColor?.[theme] || colors.title,
                body: colorContrast(
                    customization.header.backgroundColor?.[theme] || colors.background,
                    [baseColors.light, baseColors.dark],
                ),
            };
            gridAsset = colors.body == baseColors.light ? gridWhite : gridBlack;
            break;

        case CustomizationHeaderPreset.Bold:
            colors = {
                background: customization.styling.primaryColor[theme],
                gradient: colorContrast(customization.styling.primaryColor[theme], [
                    baseColors.light,
                    baseColors.dark,
                ]),
                title: colorContrast(customization.styling.primaryColor[theme], [
                    baseColors.light,
                    baseColors.dark,
                ]),
                body: colorContrast(customization.styling.primaryColor[theme], [
                    baseColors.light,
                    baseColors.dark,
                ]),
            };
            gridAsset = colors.body == baseColors.light ? gridWhite : gridBlack;
            break;
    }

    const favicon = function () {
        if ('icon' in customization.favicon)
            return (
                <img
                    src={customization.favicon.icon[theme]}
                    width={40}
                    height={40}
                    tw={tcls('mr-4')}
                    alt="Icon"
                />
            );
        if ('emoji' in customization.favicon)
            return (
                <span tw={tcls('text-4xl', 'mr-4')}>
                    {String.fromCodePoint(parseInt('0x' + customization.favicon.emoji))}
                </span>
            );
        return (
            <img
                src={absoluteHref(
                    `~gitbook/icon?size=medium&theme=${customization.themes.default}`,
                    true,
                )}
                alt="Icon"
                width={40}
                height={40}
                tw={tcls('mr-4')}
            />
        );
    };

    return new ImageResponse(
        (
            <div
                tw={tcls(
                    'justify-between',
                    'p-20',
                    'relative',
                    'w-full',
                    'h-full',
                    'flex',
                    'flex-col',
                    `bg-[${colors.background}]`,
                    `text-[${colors.body}]`,
                )}
            >
                {/* Gradient */}
                <div
                    tw={tcls('absolute', 'inset-0')}
                    style={{
                        backgroundImage: `radial-gradient(ellipse 100% 100% at top right , ${colors.gradient}, ${colors.gradient}00)`,
                        opacity: 0.5,
                    }}
                ></div>

                {/* Grid */}
                <img
                    tw={tcls('absolute', 'inset-0', 'w-[100vw]', 'h-[100vh]')}
                    src={gridAsset}
                    alt="Grid"
                />

                {/* Logo */}
                {customization.header.logo ? (
                    <img
                        alt="Logo"
                        height={60}
                        src={
                            useLightTheme
                                ? customization.header.logo.light
                                : customization.header.logo.dark
                        }
                    />
                ) : (
                    <div tw={tcls('flex')}>
                        {favicon()}
                        <h3 tw={tcls('text-4xl', 'my-0')}>
                            {getContentTitle(space, customization, site ?? null)}
                        </h3>
                    </div>
                )}

                {/* Title and description */}
                <div tw={tcls('flex', 'flex-col')}>
                    <h1
                        tw={tcls(
                            'text-8xl',
                            'my-0',
                            'tracking-tight',
                            'leading-none',
                            'text-left',
                            `text-[${colors.title}]`,
                            'font-bold',
                        )}
                    >
                        {page
                            ? page.title.length > 64
                                ? page.title.slice(0, 64) + '...'
                                : page.title
                            : 'Not found'}
                    </h1>
                    {page?.description && page?.title.length <= 64 ? (
                        <h2 tw={tcls('text-4xl', 'mb-0', 'mt-8', 'w-[75%]', 'font-normal')}>
                            {page.description.length > 164
                                ? page.description.slice(0, 164) + '...'
                                : page.description}
                        </h2>
                    ) : null}
                </div>
            </div>
        ),
        imageOptions,
    );
}
