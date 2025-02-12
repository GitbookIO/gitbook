import { CustomizationDefaultFont, CustomizationHeaderPreset } from '@gitbook/api';
import { colorContrast } from '@gitbook/colors';
import { redirect } from 'next/navigation';
import { ImageResponse } from 'next/og';

import { type PageParams, fetchPageData } from '@/components/SitePage';
import { getFontSourcesToPreload } from '@/fonts/custom';
import { getAssetURL } from '@/lib/assets';
import { filterOutNullable } from '@/lib/typescript';
import type { GitBookSiteContext } from '@v2/lib/context';
import { getResizedImageURL } from '@v2/lib/images';

const googleFontsMap: { [fontName in CustomizationDefaultFont]: string } = {
    [CustomizationDefaultFont.Inter]: 'Inter',
    [CustomizationDefaultFont.FiraSans]: 'Fira Sans Extra Condensed',
    [CustomizationDefaultFont.IBMPlexSerif]: 'IBM Plex Serif',
    [CustomizationDefaultFont.Lato]: 'Lato',
    [CustomizationDefaultFont.Merriweather]: 'Merriweather',
    [CustomizationDefaultFont.NotoSans]: 'Noto Sans',
    [CustomizationDefaultFont.OpenSans]: 'Open Sans',
    [CustomizationDefaultFont.Overpass]: 'Overpass',
    [CustomizationDefaultFont.Poppins]: 'Poppins',
    [CustomizationDefaultFont.Raleway]: 'Raleway',
    [CustomizationDefaultFont.Roboto]: 'Roboto',
    [CustomizationDefaultFont.RobotoSlab]: 'Roboto Slab',
    [CustomizationDefaultFont.SourceSansPro]: 'Source Sans 3',
    [CustomizationDefaultFont.Ubuntu]: 'Ubuntu',
    [CustomizationDefaultFont.ABCFavorit]: 'Inter',
};

/**
 * Render the OpenGraph image for a site content.
 */
export async function serveOGImage(baseContext: GitBookSiteContext, params: PageParams) {
    const { context, pageTarget } = await fetchPageData(baseContext, params);
    const { customization, site, linker, imageResizer } = context;
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
    const contentTitle = customization.header.logo ? '' : site.title;
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
    const { fontFamily, fonts } = await (async () => {
        // google fonts
        if (typeof customization.styling.font === 'string') {
            const fontFamily = googleFontsMap[customization.styling.font] ?? 'Inter';

            const regularText = pageDescription;
            const boldText = `${contentTitle}${pageTitle}`;

            const fonts = (
                await Promise.all([
                    loadGoogleFont({ fontFamily, text: regularText, weight: 400 }),
                    loadGoogleFont({ fontFamily, text: boldText, weight: 700 }),
                ])
            ).filter(filterOutNullable);

            return { fontFamily, fonts };
        }

        // custom fonts
        // We only load the primary font weights for now
        const primaryFontWeights = getFontSourcesToPreload(customization.styling.font);

        const fonts = (
            await Promise.all(
                primaryFontWeights.map((face) => {
                    const { weight, sources } = face;
                    if (sources.length === 0) {
                        return null;
                    }
                    const url = sources[0].url;

                    return loadCustomFont({ url, weight });
                })
            )
        ).filter(filterOutNullable);

        return { fontFamily: 'CustomFont', fonts };
    })();

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
                ),
            };
            gridAsset = colors.body === baseColors.light ? gridWhite : gridBlack;
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
            gridAsset = colors.body === baseColors.light ? gridWhite : gridBlack;
            break;
    }

    const favicon = await (async () => {
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
                    {String.fromCodePoint(Number.parseInt(`0x${customization.favicon.emoji}`))}
                </span>
            );
        const src = linker.toAbsoluteURL(
            linker.toPathInSpace(`~gitbook/icon?size=medium&theme=${customization.themes.default}`)
        );
        return <img src={src} alt="Icon" width={40} height={40} tw="mr-4" />;
    })();

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
                    {favicon}
                    <h3 tw="text-4xl my-0 font-bold">{contentTitle}</h3>
                </div>
            )}

            {/* Title and description */}
            <div tw="flex flex-col">
                <h1
                    tw={`text-8xl my-0 tracking-tight leading-none text-left text-[${colors.title}] font-bold`}
                >
                    {pageTitle}
                </h1>
                {pageDescription ? (
                    <h2 tw="text-4xl mb-0 mt-8 w-[75%] font-normal">{pageDescription}</h2>
                ) : null}
            </div>
        </div>,
        {
            width: 1200,
            height: 630,
            fonts: fonts.length ? fonts : undefined,
        }
    );
}

async function loadGoogleFont(input: { fontFamily: string; text: string; weight: 400 | 700 }) {
    const { fontFamily, text, weight } = input;

    if (!text.trim()) {
        return null;
    }

    const url = new URL('https://fonts.googleapis.com/css2');
    url.searchParams.set('family', `${fontFamily}:wght@${weight}`);
    url.searchParams.set('text', text);

    const result = await fetch(url.href);
    if (!result.ok) {
        return null;
    }

    const css = await result.text();
    const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);
    const resourceUrl = resource ? resource[1] : null;

    if (resourceUrl) {
        const response = await fetch(resourceUrl);
        if (response.ok) {
            const data = await response.arrayBuffer();
            return {
                name: fontFamily,
                data,
                style: 'normal' as const,
                weight,
            };
        }
    }

    // If for some reason we can't load the font, we'll just use the default one
    return null;
}

async function loadCustomFont(input: { url: string; weight: 400 | 700 }) {
    const { url, weight } = input;
    const response = await fetch(url);
    if (!response.ok) {
        return null;
    }

    const data = await response.arrayBuffer();

    return {
        name: 'CustomFont',
        data,
        style: 'normal' as const,
        weight,
    };
}
