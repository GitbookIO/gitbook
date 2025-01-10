import { CustomizationHeaderPreset } from '@gitbook/api';
import { redirect } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import colorContrast from 'postcss-color-contrast/js';
import React from 'react';

import { getGitBookContextFromHeaders } from '@/lib/gitbook-context';
import { getAbsoluteHref } from '@/lib/links';
import { getContentTitle } from '@/lib/utils';

import { PageIdParams, fetchPageData } from '../../../../fetch';

export const runtime = 'edge';

async function loadGoogleFont(font: string, text: string) {
    const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

    if (resource) {
        const response = await fetch(resource[1]);
        if (response.status == 200) {
            return await response.arrayBuffer();
        }
    }

    throw new Error('failed to load font data');
}

/**
 * Render the OpenGraph image for a space.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<PageIdParams> }) {
    const ctx = getGitBookContextFromHeaders(req.headers);
    const { space, page, customization, site } = await fetchPageData(ctx, await params);

    // If user configured a custom social preview, we redirect to it.
    if (customization.socialPreview.url) {
        redirect(customization.socialPreview.url);
    }

    // Compute all text to load only the necessary fonts
    const contentTitle = customization.header.logo
        ? ''
        : getContentTitle(space, customization, site ?? null);
    const pageTitle = page
        ? page.title.length > 64
            ? page.title.slice(0, 64) + '...'
            : page.title
        : 'Not found';
    const pageDescription =
        page?.description && page?.title.length <= 64
            ? page.description.length > 164
                ? page.description.slice(0, 164) + '...'
                : page.description
            : '';

    // TODO: Support all fonts available in GitBook
    const inter = loadGoogleFont('Inter', `${contentTitle}${pageTitle}${pageDescription}`);

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

    const gridWhite = getAbsoluteHref(ctx, '~gitbook/static/images/ogimage-grid-white.png', true);
    const gridBlack = getAbsoluteHref(ctx, '~gitbook/static/images/ogimage-grid-black.png', true);

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

    return new ImageResponse(
        (
            <div
                tw={`justify-between p-20 relative w-full h-full flex flex-col bg-[${colors.background}] text-[${colors.body}]`}
            >
                {/* Gradient */}
                <div
                    tw="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(ellipse 100% 100% at top right , ${colors.gradient}, ${colors.gradient}00)`,
                        opacity: 0.5,
                    }}
                ></div>

                {/* Grid */}
                <img tw="absolute inset-0 w-[100vw] h-[100vh]" src={gridAsset} alt="Grid" />

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
                    <div tw="flex">
                        {(() => {
                            if ('icon' in customization.favicon)
                                return (
                                    <img
                                        src={customization.favicon.icon[theme]}
                                        width={40}
                                        height={40}
                                        tw="mr-4"
                                        alt="Icon"
                                    />
                                );
                            if ('emoji' in customization.favicon)
                                return (
                                    <span tw="text-4xl mr-4">
                                        {String.fromCodePoint(
                                            parseInt('0x' + customization.favicon.emoji),
                                        )}
                                    </span>
                                );
                            const src = getAbsoluteHref(
                                ctx,
                                `~gitbook/icon?size=medium&theme=${customization.themes.default}`,
                                true,
                            );
                            return <img src={src} alt="Icon" width={40} height={40} tw="mr-4" />;
                        })()}
                        <h3 tw="text-4xl my-0">{contentTitle}</h3>
                    </div>
                )}

                {/* Title and description */}
                <div tw="flex flex-col">
                    <h1
                        tw={`text-8xl my-0 tracking-light leading-none text-left text-[${colors.title}] font-bold`}
                    >
                        {pageTitle}
                    </h1>
                    {pageDescription ? (
                        <h2 tw="text-4xl mb-0 mt-8 w-[75%] font-normal">{pageDescription}</h2>
                    ) : null}
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: 'Inter',
                    data: await inter,
                    style: 'normal',
                },
            ],
        },
    );
}
